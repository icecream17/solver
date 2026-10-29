# Svelte 5 rewrite

The UI, state ownership, solver orchestration, dialogs, keyboard handlers, build,
and browser tests were rebuilt around Svelte 5 and Vite. Mathematical strategies
and puzzle fixtures were ported rather than rederived. The core is independent
of components, Svelte runes and browser globals.

## Architecture

- `core/board.ts` owns a strategy's working board; `core/strategies/` contains all
  18 original strategies in their original order.
- `core/session.ts` implements synchronous Step/Go on snapshots. Each result is a
  new session. A contradiction rolls back the attempted strategy's board changes.
- `core/solver.worker.ts` runs those commands off the browser's main thread.
  `solver-runner.ts` owns worker messages, progress, errors and termination.
- `workspace.svelte.ts` owns reactive state, selection and a bounded undo history.
  Editing, importing, undoing or toggling strategies cancels an active operation.
  Operation generations prevent late results from replacing newer state.
- Components render data and send actions upward. The solver never waits for a
  render or registers component instances.

## Explanation data

Strategies write annotations through `core/annotations.ts` into the working Board.
`core/marks.ts` gives that data a shared type:

```ts
// Keys are row * 9 + column. Missing cells have no reasoning marks.
const annotations: Annotations = {
   0: { cells: ['orange'], candidates: { 2: ['blue'], 7: ['green'] } }
}
```

`cells` holds whole-cell reasoning roles; `candidates` holds roles for individual
digits. Names retain the original palette: blue reason, green alternate, orange
pivot, salmon secondary pivot, and solved. They are plain serializable data, so
worker transfer and snapshots do not depend on a DOM or reactive proxy. Board
methods own writes; rendering treats the records as read-only. At the Board/Cell
boundary, missing entries become a shared immutable `EMPTY_CELL_MARKS`, making the
Cell prop required and avoiding repeated optional handling.

Added/eliminated candidates are derived from the current and previous grids,
rather than being stored as a second annotation representation. Diffs take visual
precedence over reasoning colors. Eliminated digits have a strike-through.
`core/explanations.ts` supplies accessible cell descriptions and a visible list
with cell coordinates, candidate changes and reasoning roles. Color is supplemental.

## State ownership and undo

The reactive boundary is the `Workspace` instance created by `App.svelte`. Its
`session` is a Svelte `$state` proxy, but everything inside the session is plain
serializable data. The core receives `$state.snapshot(session)`, not the proxy.
There is no global store or second editable copy of the candidate grid in the UI.

| State                                                                                                                | Owner                                                                             | Consumers and lifetime                                                                                                               |
| -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Candidate grid, previous grid, marks, strategy cursor/results, disabled/skip flags, solved count and outcome/message | `core/session.ts` defines the shape; `workspace.svelte.ts` owns the current value | Board/Cell render candidates; Tools renders strategy state; retained across tab switches                                             |
| Selected flat cell indices and active/inactive selection                                                             | `workspace.svelte.ts`                                                             | Board supplies each Cell's selection props; CandidatePad edits the same selection                                                    |
| First-entry bookkeeping (`fresh`)                                                                                    | Private Workspace Set                                                             | Selected all-nine cells start with an empty candidate list when the next digit is typed; recomputed on selection/navigation and undo |
| Undo snapshots and `canUndo`                                                                                         | Private Workspace history plus a reactive availability flag                       | At most 100 sessions; selection/focus and pending requests are not snapshotted                                                       |
| Busy flag, progress/error text and request generation                                                                | Workspace                                                                         | Tools disables duplicate solve commands and offers Cancel; App displays live status                                                  |
| Current tools tab                                                                                                    | `Tools.svelte` local `$state`                                                     | Switching tabs does not recreate Workspace or clear strategy results                                                                 |
| Transfer mode and opener element                                                                                     | `App.svelte` local `$state`                                                       | Exist while coordinating the import/export dialog                                                                                    |
| Held keys and temporary focus guards                                                                                 | `Board.svelte` local event bookkeeping                                            | Used only while handling keyboard/pointer events, not as render state                                                                |

An edit copies the grid, changes the selected cells, and records the old session
only if candidates actually changed. It then creates a fresh session while keeping
strategy enablement. Clear and successful import record history, reset solver
state, and deselect. A completed Step/Go records one history entry for the whole
command, even if Go tried several strategies; a cancelled/failed worker request
does not commit its partial work.

Undo cancels active work and restores the previous session, including cursor,
results and explanation grids. It keeps the **current** disabled-strategy flags:
enablement is a preference rather than part of board history. Selected indices
stay selected, and first-entry bookkeeping is recomputed against the restored
grid. This is why the sequence type 1 → keyboard Undo → type 2 starts a new entry.

## Solver command and worker lifecycle

The browser path crosses five files. The same synchronous core can also be called
directly by tests and the benchmark without creating a worker.

| Boundary                               | Data/action                                             | Responsibility                                                                                        |
| -------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `Tools.svelte` → `workspace.svelte.ts` | `solve('step' or 'go')`                                 | Start one operation, expose busy/progress state, snapshot the current session                         |
| Workspace → `solver-runner.ts`         | `SolverRunner.run(session, mode, onProgress)`           | Abstract transport; tests can inject an implementation without replacing the solver                   |
| Runner → `core/solver.worker.ts`       | `SolverRequest = { session, mode }`                     | Create a fresh module worker; send structured-cloned plain data                                       |
| Worker → `core/session.ts`             | `step` or `go` plus a strategy callback                 | Compute entirely inside the worker; no component or DOM access                                        |
| Worker → Runner → Workspace            | `{ progress: name }`, then `{ session }` or `{ error }` | Progress updates status; the terminal response terminates the worker and resolves/rejects the command |

Cancellation uses termination rather than a cancellation message: a worker busy in
a synchronous recursive strategy could not receive that message until the search
returned. `WorkerSolverRunner.cancel()` terminates it and rejects the pending
promise with `AbortError`. Workspace increments an operation generation before
cancelling, so late progress/results/catch/finally callbacks cannot affect a newer
operation. Runner also rejects messages from a worker it no longer owns. Both
checks matter: transport ownership and application state have different lifetimes.

Editing, Clear, successful import, Undo and a strategy toggle cancel active work.
App teardown also cancels. Selection/navigation alone does not change the grid and
does not cancel. While solving, the committed board stays visible; intermediate
mutations exist only in the worker. Computation errors become a text response;
worker transport errors become a readable rejection. The existing session survives
both. Workers are created on demand and terminated after each command, trading
startup/clone overhead for simple ownership and immediate cancellation.

## Strategy execution, validation and scan state

`core/strategies/Strategies.ts` defines executable strategy order. `core/catalog.ts`
associates each index with its UI name, learning link and whether it is required.
The parallel arrays are positional: catalog entries, results, disabled flags,
skippable flags and strategy memory all refer to that same index. Strategy zero
(Check for solved) is mandatory. `core/strategy-types.ts` defines result variants
and the `SuccessError` sentinel; a failure to find progress is distinct from an
invalid-board error.

A Step performs these phases in `core/session.ts`:

1. Find the next enabled strategy and report its name. At index zero, reset the
   previous pass's results/skip flags.
2. Copy the session grid into a new mutable `Board`, allocate `StrategyMemory`,
   seed its solved counter from the session, and run that strategy.
3. Compare candidates and run `checkValidity`. A strategy error or a changed grid
   with a contradiction keeps the input grid and publishes an error result rather
   than exposing a partially mutated board. Exceptions are handled by the worker
   boundary when using the browser transport.
4. Choose the next cursor: restart after a successful nonzero strategy; continue
   after no change; or return to zero with a stalled, solved or error outcome.
5. Return a new Session. Successful results carry the previous grid and Board marks
   for explanation; otherwise those explanation fields are cleared.

`StrategyMemory` is recreated for each Step; only its solved counter is carried
through the Session. It is not a long-lived mutable cache shared with components.
An unchanged solved count does not skip candidate propagation. Changing a strategy
switch cancels work and resets the cursor/skip flags, so re-enabled strategies are
considered on the next pass.

Go repeatedly calls Step, stopping when the cursor returns to zero or a terminal
outcome occurs, with a catalog-length guard on the number of attempts. That guard
bounds the number of strategy calls, **not** the duration of an individual search;
the worker boundary supplies responsiveness for expensive chain searches.

## Board representation and geometry identity

`core/types.ts`, `core/board.ts`, `core/geometry.ts` and the strategy modules share
three related representations. They are not interchangeable:

| Representation                     | Meaning and use                                                                                                                                                          |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Grid` / `Board.data[row][column]` | A 9 × 9 array of candidate arrays. Digits are 1–9; coordinates are 0–8. One candidate represents a solved cell, nine an untouched/full candidate set, zero an empty set. |
| Flat number `row * 9 + column`     | UI selection and sparse annotation keys, in the range 0–80                                                                                                               |
| `CellID` / `CandidateID`           | Core position objects used by geometric sets and strategies; the latter also includes a digit                                                                            |

`geometry.id(row, column[, digit])` interns these objects: asking for the same
position returns the same object within that JavaScript realm. Strategy code uses
object identity in `Set.has`, array inclusion, intersections and differences. A
new `CellID` with matching numeric coordinates is not equivalent for those
operations. Board group/candidate-location methods obtain their IDs through this
factory. The worker has its own identity cache; IDs are computed there rather than
being stored in Session messages and relying on cross-worker identity.

`Board.getCandidateLocations()` builds a digit-indexed lookup (indices 1–9), with
nine sets for each of row/column/box. Each set contains the canonical CellIDs where
that digit remains possible. Strategies combine these lookups with geometry's
peer/group operations and write eliminations to the working Board. These lookups
are computation-local derived data, not another reactive store. Group labels use
`ROW_NAMES`, `COLUMN_NAMES` and `BOX_NAMES`; the row alphabet skips I.

## Selection, keyboard and focus coordination

`Board.svelte` connects DOM events to Workspace actions; `Cell.svelte` renders a
stable button and receives callbacks. `CandidatePad.svelte` calls the same edit
methods for touch input. Candidate arrays are not edited inside a Cell.

Pointer selection can replace a digit span with a candidate grid under the pointer.
Board therefore prevents the default pointer focus action, updates selection, and
explicitly focuses the stable button. Its `pointerFocus` guard prevents the ensuing
focus/blur events from selecting a second time or deactivating the new selection.
A separate `navigating` guard does the same around programmatic movement. These are
short-lived event guards, not persistent selection state.

The window-level held-key Set tracks Ctrl/Command multiselection and combined
repeat movement. Keyup removes keys; window blur clears the Set and deactivates
selection; context-menu opening also clears held keys. Arrow/Home/End/Page movement
updates Workspace indices before moving DOM focus. Tab uses the browser's native
focus order, with the next cell's focus handler updating selection. All 81 cells
remain in the Tab order to retain the legacy interaction; this is a deliberate
choice rather than the single-tab-stop composite-grid model.

Inactive selection is distinct from no selection: blur deactivates it, allowing
multiple selected cells to remain visible when controls take focus. Escape clears
it. `fresh` is separate again: it decides whether the next digit starts a new entry
or toggles an existing candidate, and is maintained by Workspace rather than DOM
focus history.

## Import/export and modal lifetime

`Tools.svelte` passes the actual opener button to App. App owns the transfer mode
and creates `TransferDialog.svelte` with that opener, the grid and callbacks. On
mount the component calls native `showModal()`; its teardown closes the dialog and
restores opener focus. Capturing the button explicitly avoids relying on browsers
to focus a button when clicked. Native modal behavior supplies background inertness
and the focus trap; Escape routes through App's close callback.

The dialog owns only draft text and validation feedback. Submitting it calls
`Workspace.import`, which calls `session.importGrid` on a temporary Board. The
Board parser tries supported normalized 81-/729-character representations, then a
whitespace candidate grid. Syntax failure returns false, leaving both the current
board and dialog open; empty input closes without importing. A successful parse
commits through Workspace's normal replacement/history path. Import format
recognition is not a guarantee of mathematical validity: contradictions are
reported by the solving/validation path.

Export uses `session.exportGrid`, which copies the supplied grid into a temporary
Board and calls its serializers; exporting does not alter session/history.
`to729()` preserves candidate membership, including empty sets. `to81()` cannot
preserve unsolved candidate subsets: a dot represents an unsolved cell, and an empty
set exports as zero, which imports as a full blank. The dialog displays both forms
rather than maintaining a separate export-state store.

## Rendering, styles and failure boundaries

`main.ts` mounts App and imports `App.css`. App owns the board/tools layout, live
status, transfer dialog and a Svelte rendering boundary. Render failures show the
report link and retry control. Solver errors use Session/operation status instead;
they are separate from render failures. Event-handler/async failures are not
assumed to be caught by the Svelte rendering boundary.

Component stylesheets are imported beside their components; these imported CSS
files are global, so selectors use component classes such as `.board`, `.cell`,
`.tools` and `.transfer-dialog`. `App.css` owns shared controls, document defaults,
layout and theme variables. `Annotations.css`, imported there, connects the same
reasoning palette to cells, candidates and the legend. CandidatePad's inline style
is Svelte-scoped. The responsive layout, candidate sizes and print rules are spread
across these owning stylesheets rather than being generated from solver state.
The board area is an inline-size query container: candidate/digit font sizes and
candidate padding use its width (`cqw`), so changing the page's column count does
not independently change their scale. Strategy rows use a four-column grid inside each list item: checkbox, centered
visual number, strategy name/link, and result. Required rows reserve an empty
checkbox slot. A shared puzzle toolbar stays mounted across tab changes; Step/Go
use `aria-disabled` while busy so keyboard focus survives a command. Workspace
rejects overlapping commands. The document reserves scrollbar space so a taller
panel does not shift the columns.
Alternating row fills sit beneath the current row's fill and logical edge marker;
the marker remains visible in forced colors. Tools-owned selectors are prefixed
with `.tools`, while the annotation palette intentionally crosses components.
Print keeps the puzzle-only layout, sets a light color scheme and dark caption /
solved-candidate text, and suppresses selection/error fills. Reasoning/difference
fills remain authored; their printing follows the browser's background setting,
with text explanations and eliminated-candidate strike-through available on screen.

`GithubCorner.svelte` contains the original SVG and uses `ExternalLink.svelte`, as
do learning/report links. That wrapper owns target, referrer/privacy attributes and
click propagation behavior. It spreads other attributes before the fixed privacy
attributes, so callers cannot override the latter through the spread.

## Build and test entry points

Vite starts at root `index.html` → `src/main.ts` → App. The worker's
`new URL('./core/solver.worker.ts', import.meta.url)` creates a second production
entry graph; Vite emits its bundle separately. The solver is consequently present
in both the main graph (session/Workspace initialization) and the worker graph.
A main-bundle-only size number misses part of the application. `public/` is copied
as-is, including the favicon, robots file and public asset README. Relative build
URLs allow hosting under the GitHub Pages repository path.

`vite.config.ts` also configures Vitest and whole-source coverage. Core tests call
domain functions directly. Workspace/component tests compile Svelte state and inject
a runner where appropriate; native production browser tests exercise the actual
worker plus dialog/focus/input behavior. `playwright.config.ts` builds/serves the
production output for that suite. `scripts/benchmark.ts` imports the same core with
the separate benchmark corpus, which is not a browser runtime dependency.

The build workflow runs checks across OS/Node versions, runs browser tests on
Linux/24, and deploys `dist/` only from the exact main ref and one matrix job.
Lint/format configuration is described separately in [development guidance](development.md).

## Feature parity

| Original capability                                              | Rewrite                                                                  |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Candidate entry/toggling and untouched-cell first entry          | Preserved, including after undo                                          |
| Clear candidates or reset to all nine                            | Preserved, including Ctrl/Shift modifiers                                |
| Active/inactive selection and Ctrl multiselection                | Preserved                                                                |
| Ctrl+A, Escape, Tab, wrapping arrows                             | Preserved                                                                |
| Home/End, Ctrl+Home/End, Page Up/Down, held-key movement         | Preserved                                                                |
| 81-cell, 729-character, candidate-grid, SudokuWiki URL import    | Preserved                                                                |
| Both export formats                                              | Shown together in a native dialog                                        |
| Step and Go                                                      | Go stops at a successful strategy/end of a pass; cancellable worker      |
| All 18 strategies, order, learning links, toggles, result counts | Preserved; toggles reset scan state                                      |
| Candidate diffs and cell/candidate explanation colors            | Preserved, with text and strike-through cues                             |
| Undo                                                             | Bounded 100-action history, including edits/import/clear/solver commands |
| Notices, validation errors, completion message                   | Inline live status                                                       |
| Render error notice and retry                                    | Svelte boundary, external report link and retry                          |
| Keyboard tabs and modal focus                                    | Native controls, keyboard tabs, native modal focus trap                  |
| Dark palette, cyan links, monospace grid, responsive columns     | Preserved; touch entry pad added                                         |
| GitHub corner, original favicon and external-link privacy        | Preserved                                                                |
| Right-to-left layout and printing                                | Logical borders/spacing and print stylesheet                             |
| GitHub Pages                                                     | Relative asset paths; main-only deployment                               |
| Strategy correctness fixtures                                    | Ported to Vitest without a rendered app                                  |

Invalid imports already preserved the previous board; the rewrite adds inline
format feedback. Strategy toggles/results survive tab changes. Undo restores the
solver cursor and explanation state. Losing window focus clears held keys, and
macOS Command shortcuts work. The solver still uses human strategies, can stall,
and does not add guessing or Sudoku variants.

## Old-to-new file map

Paths are relative to the repository root. This maps every old `src/` and `public/`
file, including consolidated and retired responsibilities; it is not a rename list.

| Old file                                           | New file or responsibility                                                                  |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `public/favicon.ico`                               | public/favicon.ico (original icon retained)                                                 |
| `public/index.html`                                | index.html                                                                                  |
| `public/logo192.png`                               | Retired unused CRA asset; public/README.md explains future PWA setup                        |
| `public/logo512.png`                               | Retired unused CRA asset; public/README.md explains future PWA setup                        |
| `public/manifest.json`                             | Retired unused manifest; public/README.md explains future PWA setup                         |
| `public/robots.txt`                                | public/robots.txt (reference comments retained)                                             |
| `src/Api/Solver.test.tsx`                          | src/core/session.test.ts; src/workspace.test.ts                                             |
| `src/Api/Solver.ts`                                | src/core/session.ts; src/workspace.svelte.ts                                                |
| `src/Api/Spaces/PureSudoku.test.ts`                | src/core/board.test.ts                                                                      |
| `src/Api/Spaces/PureSudoku.ts`                     | src/core/board.ts                                                                           |
| `src/Api/Spaces/Sudoku.ts`                         | src/core/annotations.ts; src/core/board.ts (DOM coupling removed)                           |
| `src/Api/Strategies/Strategies.test.tsx`           | src/core/strategies/strategies.test.ts                                                      |
| `src/Api/Strategies/Strategies.ts`                 | src/core/strategies/Strategies.ts; src/core/catalog.ts; src/core/strategy-types.ts          |
| `src/Api/Strategies/checkForSolved.ts`             | src/core/strategies/checkForSolved.ts                                                       |
| `src/Api/Strategies/checkValidity.test.ts`         | src/core/strategies/checkValidity.test.ts                                                   |
| `src/Api/Strategies/checkValidity.ts`              | src/core/strategies/checkValidity.ts                                                        |
| `src/Api/Strategies/combinations.test.ts`          | src/core/strategies/combinations.test.ts                                                    |
| `src/Api/Strategies/fish.ts`                       | src/core/strategies/fish.ts                                                                 |
| `src/Api/Strategies/hiddenPairsTriplesAndQuads.ts` | src/core/strategies/hiddenPairsTriplesAndQuads.ts                                           |
| `src/Api/Strategies/hiddenSingles.ts`              | src/core/strategies/hiddenSingles.ts                                                        |
| `src/Api/Strategies/intersectionRemoval.ts`        | src/core/strategies/intersectionRemoval.ts                                                  |
| `src/Api/Strategies/jellyfish.ts`                  | src/core/strategies/jellyfish.ts                                                            |
| `src/Api/Strategies/pairCoversGroup.ts`            | src/core/strategies/pairCoversGroup.ts                                                      |
| `src/Api/Strategies/pairsTriplesAndQuads.ts`       | src/core/strategies/pairsTriplesAndQuads.ts                                                 |
| `src/Api/Strategies/skyscraper.ts`                 | src/core/strategies/skyscraper.ts                                                           |
| `src/Api/Strategies/swordfish.ts`                  | src/core/strategies/swordfish.ts                                                            |
| `src/Api/Strategies/timeStrategies.test.ts`        | scripts/benchmark.ts (benchmark separated from tests)                                       |
| `src/Api/Strategies/twoMinusOneLines.ts`           | src/core/strategies/twoMinusOneLines.ts                                                     |
| `src/Api/Strategies/twoStringKite.ts`              | src/core/strategies/twoStringKite.ts                                                        |
| `src/Api/Strategies/updateCandidates.ts`           | src/core/strategies/updateCandidates.ts                                                     |
| `src/Api/Strategies/wWing.ts`                      | src/core/strategies/wWing.ts                                                                |
| `src/Api/Strategies/xWing.ts`                      | src/core/strategies/xWing.ts                                                                |
| `src/Api/Strategies/xyChain.ts`                    | src/core/strategies/xyChain.ts                                                              |
| `src/Api/Strategies/xyLoop.ts`                     | src/core/strategies/xyLoop.ts                                                               |
| `src/Api/Strategies/xyzWing.ts`                    | src/core/strategies/xyzWing.ts                                                              |
| `src/Api/Strategies/yWing.ts`                      | src/core/strategies/yWing.ts                                                                |
| `src/Api/Types.ts`                                 | src/core/strategy-types.ts                                                                  |
| `src/Api/Utils.dependent.ts`                       | src/core/annotations.ts                                                                     |
| `src/Api/Utils.test.ts`                            | src/core/geometry.test.ts                                                                   |
| `src/Api/Utils.ts`                                 | src/core/geometry.ts                                                                        |
| `src/Api/boards.ts`                                | src/core/fixtures.ts                                                                        |
| `src/Api/mtBoards.ts`                              | src/core/benchmark-boards.ts                                                                |
| `src/App.css`                                      | src/App.css; src/components/*.css                                                           |
| `src/App.test.tsx`                                 | src/App.test.ts; e2e/solver.spec.ts                                                         |
| `src/App.tsx`                                      | src/App.svelte; src/workspace.svelte.ts                                                     |
| `src/Elems/Aside.css`                              | src/components/Tools.css                                                                    |
| `src/Elems/Aside.test.tsx`                         | src/App.test.ts; e2e/solver.spec.ts                                                         |
| `src/Elems/Aside.tsx`                              | src/components/Tools.svelte; src/core/catalog.ts                                            |
| `src/Elems/AsideElems/SolverPart.tsx`              | src/components/Tools.svelte; src/core/catalog.ts                                            |
| `src/Elems/AsideElems/StrategyControl.tsx`         | src/components/Tools.svelte; src/core/catalog.ts                                            |
| `src/Elems/AsideElems/StrategyControls.tsx`        | src/components/Tools.svelte; src/core/catalog.ts                                            |
| `src/Elems/AsideElems/StrategyDetails.css`         | src/components/Tools.css                                                                    |
| `src/Elems/AsideElems/StrategyDetails.tsx`         | src/components/Tools.svelte; src/core/catalog.ts                                            |
| `src/Elems/AsideElems/StrategyItem.css`            | src/components/Tools.css                                                                    |
| `src/Elems/AsideElems/StrategyItem.tsx`            | src/components/Tools.svelte; src/core/catalog.ts                                            |
| `src/Elems/AsideElems/StrategyLabel.tsx`           | src/components/Tools.svelte; src/core/catalog.ts                                            |
| `src/Elems/AsideElems/StrategyList.css`            | src/components/Tools.css                                                                    |
| `src/Elems/AsideElems/StrategyList.tsx`            | src/components/Tools.svelte; src/core/catalog.ts                                            |
| `src/Elems/AsideElems/StrategyStatus.tsx`          | src/components/Tools.svelte; src/core/catalog.ts                                            |
| `src/Elems/AsideElems/StrategyToggler.tsx`         | src/components/Tools.svelte; src/core/catalog.ts                                            |
| `src/Elems/AsideElems/Tab.tsx`                     | src/components/Tools.svelte; src/core/catalog.ts                                            |
| `src/Elems/AsideElems/Tabs.css`                    | src/components/Tools.css                                                                    |
| `src/Elems/AsideElems/Tabs.test.tsx`               | src/App.test.ts; e2e/solver.spec.ts                                                         |
| `src/Elems/AsideElems/Tabs.tsx`                    | src/components/Tools.svelte; src/core/catalog.ts                                            |
| `src/Elems/Control.tsx`                            | src/components/Tools.svelte; src/components/TransferDialog.svelte                           |
| `src/Elems/ExternalLink.test.tsx`                  | src/App.test.ts; e2e/solver.spec.ts (rendered links)                                        |
| `src/Elems/ExternalLink.tsx`                       | src/components/ExternalLink.svelte                                                          |
| `src/Elems/GithubCorner.css`                       | src/components/GithubCorner.css                                                             |
| `src/Elems/GithubCorner.tsx`                       | src/components/GithubCorner.svelte                                                          |
| `src/Elems/Main.css`                               | src/components/Board.css                                                                    |
| `src/Elems/Main.tsx`                               | src/components/Board.svelte; src/workspace.svelte.ts                                        |
| `src/Elems/MainElems/Candidate.css`                | src/components/Cell.svelte; src/components/Cell.css; src/components/Annotations.css         |
| `src/Elems/MainElems/Candidate.tsx`                | src/components/Cell.svelte; src/components/Cell.css; src/components/Annotations.css         |
| `src/Elems/MainElems/Candidates.css`               | src/components/Cell.svelte; src/components/Cell.css; src/components/Annotations.css         |
| `src/Elems/MainElems/Candidates.tsx`               | src/components/Cell.svelte; src/components/Cell.css; src/components/Annotations.css         |
| `src/Elems/MainElems/CandidatesDiff.tsx`           | src/components/Cell.svelte; src/components/Cell.css; src/components/Annotations.css         |
| `src/Elems/MainElems/Cell.tsx`                     | src/components/Cell.svelte; src/workspace.svelte.ts                                         |
| `src/Elems/MainElems/Row.tsx`                      | src/components/Board.svelte                                                                 |
| `src/Elems/MainElems/Sudoku.css`                   | src/components/Board.css                                                                    |
| `src/Elems/MainElems/Sudoku.md`                    | README.md (keyboard table); docs/svelte-rewrite.md                                          |
| `src/Elems/MainElems/Sudoku.test.tsx`              | src/App.test.ts; e2e/solver.spec.ts                                                         |
| `src/Elems/MainElems/Sudoku.testUtils.ts`          | src/App.test.ts; e2e/solver.spec.ts                                                         |
| `src/Elems/MainElems/Sudoku.tsx`                   | src/components/Board.svelte                                                                 |
| `src/Elems/NoticeElems/AlertNotice.css`            | src/App.svelte; src/App.css (inline status and boundary)                                    |
| `src/Elems/NoticeElems/AlertNotice.tsx`            | src/App.svelte; src/App.css (inline status and boundary)                                    |
| `src/Elems/NoticeElems/NoticeWindow.tsx`           | src/App.svelte; src/App.css (inline status and boundary)                                    |
| `src/Elems/NoticeElems/PromptWindow.css`           | src/components/TransferDialog.svelte; src/components/TransferDialog.css                     |
| `src/Elems/NoticeElems/PromptWindow.tsx`           | src/components/TransferDialog.svelte; src/components/TransferDialog.css                     |
| `src/Elems/StaticComponent.tsx`                    | Retired; ordinary Svelte components and derived state                                       |
| `src/Elems/Title.tsx`                              | src/App.svelte                                                                              |
| `src/Elems/Version.tsx`                            | src/App.svelte (version label)                                                              |
| `src/ErrorNotice.css`                              | src/App.css (failure notice)                                                                |
| `src/ErrorNotice.tsx`                              | src/App.svelte (Svelte boundary)                                                            |
| `src/Types.tsx`                                    | src/core/types.ts; local component Props types                                              |
| `src/asyncPrompt.ts`                               | src/components/TransferDialog.svelte (native dialog)                                        |
| `src/deprecate.test.ts`                            | Retired with obsolete migration helper                                                      |
| `src/deprecate.ts`                                 | Retired; obsolete migration helper                                                          |
| `src/eventRegistry.ts`                             | Retired; declarative Svelte handlers and onDestroy cleanup                                  |
| `src/general.test.tsx`                             | src/App.test.ts; src/core/session.test.ts                                                   |
| `src/index.css`                                    | src/App.css                                                                                 |
| `src/index.tsx`                                    | src/main.ts                                                                                 |
| `src/keyboardListener.test.ts`                     | src/App.test.ts; e2e/solver.spec.ts                                                         |
| `src/keyboardListener.ts`                          | src/components/Board.svelte; src/workspace.svelte.ts                                        |
| `src/logo.svg`                                     | Retired; unused starter asset                                                               |
| `src/react-app-env.d.ts`                           | tsconfig.json (vite/client types)                                                           |
| `src/reportWebVitals.ts`                           | Retired unused helper; docs/development.md links performance guidance                       |
| `src/setupTests.ts`                                | src/App.test.ts (local dialog stubs); vite.config.ts (test configuration)                   |
| `src/testUtils.ts`                                 | src/core/strategies/strategies.test.ts; src/App.test.ts (local helpers)                     |
| `src/utils.test.ts`                                | src/core/text.test.ts (retained utility edge-case tests)                                    |
| `src/utils.ts`                                     | src/core/text.ts; src/components/ExternalLink.svelte (bubbling); render-wait helper retired |

Build/configuration mapping:

| Old file or mechanism                  | Replacement                                                             |
| -------------------------------------- | ----------------------------------------------------------------------- |
| CRA / `react-scripts`                  | `vite.config.ts`; `svelte.config.js`; `index.html`                      |
| `.eslintrc`                            | `eslint.config.js`; `.prettierrc.json`; `.editorconfig`                 |
| `yarn.lock`                            | `package-lock.json` and `npm ci`                                        |
| `tsconfig.json`                        | `tsconfig.json` (Svelte files, ESNext language/types)                   |
| `.github/workflows/build.yml`          | Same path; npm, lint/format, Node matrix and browser tests              |
| React render synchronization           | `core/session.ts` snapshots and `solver-runner.ts` worker transport     |
| Component mutation/color registration  | `core/marks.ts`; `core/annotations.ts`; `core/explanations.ts`          |
| Physical-keyboard-only candidate entry | `components/CandidatePad.svelte` supplements existing keyboard handlers |
| Core-only coverage                     | `vite.config.ts` includes application state and Svelte components       |

Historical research, changelog, license and repository metadata remain in place.

## Verified production build sizes

Measured on October 28, 2026, with Node **24.22.1**. The old build is the PR base
`5f586e18b675826e8069a1b72a9518070b22b029` (React/CRA); the new build is
`f56eb20d3dbdec39c8ca73bd46bb5a35670b90f2` (Svelte/Vite, including the cancellable
worker and review fixes). The subsequent documentation changes do not affect
production assets. Both were freshly built from their committed dependency locks
without changing application code, minification, browser targets or source-map
settings. This compares the projects as configured, not an isolated measurement
of framework overhead with otherwise identical pipelines/features.

Sizes below are **bytes**, summed over every regular file recursively, not disk
allocation blocks. “Gzip” sums independently compressed files at level 9 with
`mtime=0` using Python 3.12.14's `gzip.compress`; the same method is applied to
both builds. These are calculated compressed sizes, not observed HTTP transfers
or claims that every public file is fetched on initial load.

| Measure                                    | Old `build/` | New `dist/` | Reduction |
| ------------------------------------------ | -----------: | ----------: | --------: |
| Complete output, raw (12 versus 7 files)   |      865,799 |     133,725 |    84.55% |
| Complete output, summed gzip               |      261,225 |      49,295 |    81.13% |
| Output excluding `.map` files, raw         |      222,520 |     133,725 |    39.90% |
| Output excluding `.map` files, summed gzip |       81,828 |      49,295 |    39.76% |
| All JavaScript + CSS, raw                  |      200,668 |     128,254 |    36.09% |
| All JavaScript + CSS, summed gzip          |       62,118 |      44,881 |    27.75% |

The complete-output reduction is dominated by **643,279 bytes of old source maps**;
CRA emits them by default and this Vite configuration emits none. Excluding maps
provides the more useful deployment comparison. Public assets also differ: the old
build includes unused CRA logos/manifest, while the new build copies the public
asset README. Both complete totals include those files, the favicon and robots
file, as well as generated HTML/metadata/license notices where present.

The JavaScript/CSS comparison includes **both** new JavaScript files:

| Executable asset                       | Raw bytes | Gzip bytes |
| -------------------------------------- | --------: | ---------: |
| Old `static/js/main.ce36eb95.js`       |   189,056 |     58,603 |
| Old `static/css/main.5efd2f70.css`     |    11,612 |      3,515 |
| New `assets/index-BCc66rQI.js`         |    94,319 |     33,787 |
| New `assets/solver.worker-DUQmtaBs.js` |    25,982 |      8,437 |
| New `assets/index-CuBX3ZPt.css`        |     7,953 |      2,657 |

The worker is fetched on demand when solving, but still counts toward the total
application. Vite's console gzip figure uses its own settings and does not list
the worker's compressed size; summing only those displayed figures understates the
new executable total. Smaller output alone does not establish faster solving or
lower memory use.

### Reproduction

Use separate worktrees at the two commits above, preserving the old Yarn lock and
new npm lock. For the old checkout, install with its bundled Yarn 3.8.7; the
measurement used `install --immutable --mode=skip-build` (skips dependency install
hooks) and invoked CRA's production entry directly:

```sh
node .yarn/releases/yarn-3.8.7.cjs install --immutable --mode=skip-build
node node_modules/react-scripts/scripts/build.js
```

The direct entry runs the production build used by `react-scripts build`, avoiding
this environment's Yarn child-process wrapper issue. The old build exited zero
and reported “Compiled successfully”; it also printed the already documented
CRA/TypeScript profiling error and stale Browserslist warnings. Dependencies and
browser data were not upgraded to remove those messages. A writable `TMPDIR` and
Yarn cache directory were supplied outside the worktrees for this environment.

For the new checkout:

```sh
npm ci
npm run build
```

Run the following after building, supplying the two actual output-directory paths:

```sh
python - /path/to/old/build /path/to/new/dist <<'PY'
import gzip
import sys
from pathlib import Path

for directory in sys.argv[1:]:
    files = [(p, p.read_bytes()) for p in Path(directory).rglob('*') if p.is_file()]
    for label, selected in [
        ('all files', files),
        ('without maps', [(p, b) for p, b in files if p.suffix != '.map']),
        ('JS + CSS', [(p, b) for p, b in files if p.suffix in {'.js', '.css'}]),
    ]:
        raw = sum(len(b) for _, b in selected)
        compressed = sum(len(gzip.compress(b, compresslevel=9, mtime=0)) for _, b in selected)
        print(directory, label, 'files:', len(selected), 'bytes:', raw, 'gzip:', compressed)
PY
```

## Verification and regression reproduction

See [development guidance](development.md) for the check commands and test boundaries.
The tests cover untouched entry after undo; propagation after toggling Update
candidates off and back on; text descriptions/struck-through eliminations; worker
errors, cancellation and stale responses; and native browser interactions.

The deliberately dense, valid candidate board below made the old synchronous XY
Ring search exceed six seconds. Each row, column and box retains possibilities;
it is not an invalid duplicate-given puzzle. It now runs in a terminable worker.
The browser regression waits for XY Ring, cancels, then verifies a new solve works.
The shared fixture is `src/core/stress-boards.ts`.

```text
12 23 34 45 56 67 78 89 19
45 56 67 78 89 19 12 23 34
78 89 19 12 23 34 45 56 67
23 34 45 56 67 78 89 19 12
56 67 78 89 19 12 23 34 45
89 19 12 23 34 45 56 67 78
34 45 56 67 78 89 19 12 23
67 78 89 19 12 23 34 45 56
19 12 23 34 45 56 67 78 89
```

Initial rewrite baseline: 124 tests; full corpus 1,465 puzzles, 496 solved, 969
stalled and no solver errors. These are historical measurements, not assertions
about later source size or coverage. The review follow-up expands tests and
coverage to UI/state and browser projects. Local Chromium exits with SIGTRAP before
loading a page in this environment; native browser verification runs in GitHub Actions.
