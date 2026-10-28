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

## Feature parity

| Original capability | Rewrite |
| --- | --- |
| Candidate entry/toggling and untouched-cell first entry | Preserved, including after undo |
| Clear candidates or reset to all nine | Preserved, including Ctrl/Shift modifiers |
| Active/inactive selection and Ctrl multiselection | Preserved |
| Ctrl+A, Escape, Tab, wrapping arrows | Preserved |
| Home/End, Ctrl+Home/End, Page Up/Down, held-key movement | Preserved |
| 81-cell, 729-character, candidate-grid, SudokuWiki URL import | Preserved |
| Both export formats | Shown together in a native dialog |
| Step and Go | Go stops at a successful strategy/end of a pass; cancellable worker |
| All 18 strategies, order, learning links, toggles, result counts | Preserved; toggles reset scan state |
| Candidate diffs and cell/candidate explanation colors | Preserved, with text and strike-through cues |
| Undo | Bounded 100-action history, including edits/import/clear/solver commands |
| Notices, validation errors, completion message | Inline live status |
| Render error notice and retry | Svelte boundary, external report link and retry |
| Keyboard tabs and modal focus | Native controls, keyboard tabs, native modal focus trap |
| Dark palette, cyan links, monospace grid, responsive columns | Preserved; touch entry pad added |
| GitHub corner, original favicon and external-link privacy | Preserved |
| Right-to-left layout and printing | Logical borders/spacing and print stylesheet |
| GitHub Pages | Relative asset paths; main-only deployment |
| Strategy correctness fixtures | Ported to Vitest without a rendered app |

Invalid imports already preserved the previous board; the rewrite adds inline
format feedback. Strategy toggles/results survive tab changes. Undo restores the
solver cursor and explanation state. Losing window focus clears held keys, and
macOS Command shortcuts work. The solver still uses human strategies, can stall,
and does not add guessing or Sudoku variants.

## Old-to-new file map

Paths are relative to the repository root. This maps every old `src/` and `public/`
file, including consolidated and retired responsibilities; it is not a rename list.

| Old file | New file or responsibility |
| --- | --- |
| `public/favicon.ico` | public/favicon.ico (original icon retained) |
| `public/index.html` | index.html |
| `public/logo192.png` | Retired unused CRA asset; public/README.md explains future PWA setup |
| `public/logo512.png` | Retired unused CRA asset; public/README.md explains future PWA setup |
| `public/manifest.json` | Retired unused manifest; public/README.md explains future PWA setup |
| `public/robots.txt` | public/robots.txt (reference comments retained) |
| `src/Api/Solver.test.tsx` | src/core/session.test.ts; src/workspace.test.ts |
| `src/Api/Solver.ts` | src/core/session.ts; src/workspace.svelte.ts |
| `src/Api/Spaces/PureSudoku.test.ts` | src/core/board.test.ts |
| `src/Api/Spaces/PureSudoku.ts` | src/core/board.ts |
| `src/Api/Spaces/Sudoku.ts` | src/core/annotations.ts; src/core/board.ts (DOM coupling removed) |
| `src/Api/Strategies/Strategies.test.tsx` | src/core/strategies/strategies.test.ts |
| `src/Api/Strategies/Strategies.ts` | src/core/strategies/Strategies.ts; src/core/catalog.ts; src/core/strategy-types.ts |
| `src/Api/Strategies/checkForSolved.ts` | src/core/strategies/checkForSolved.ts |
| `src/Api/Strategies/checkValidity.test.ts` | src/core/strategies/checkValidity.test.ts |
| `src/Api/Strategies/checkValidity.ts` | src/core/strategies/checkValidity.ts |
| `src/Api/Strategies/combinations.test.ts` | src/core/strategies/combinations.test.ts |
| `src/Api/Strategies/fish.ts` | src/core/strategies/fish.ts |
| `src/Api/Strategies/hiddenPairsTriplesAndQuads.ts` | src/core/strategies/hiddenPairsTriplesAndQuads.ts |
| `src/Api/Strategies/hiddenSingles.ts` | src/core/strategies/hiddenSingles.ts |
| `src/Api/Strategies/intersectionRemoval.ts` | src/core/strategies/intersectionRemoval.ts |
| `src/Api/Strategies/jellyfish.ts` | src/core/strategies/jellyfish.ts |
| `src/Api/Strategies/pairCoversGroup.ts` | src/core/strategies/pairCoversGroup.ts |
| `src/Api/Strategies/pairsTriplesAndQuads.ts` | src/core/strategies/pairsTriplesAndQuads.ts |
| `src/Api/Strategies/skyscraper.ts` | src/core/strategies/skyscraper.ts |
| `src/Api/Strategies/swordfish.ts` | src/core/strategies/swordfish.ts |
| `src/Api/Strategies/timeStrategies.test.ts` | scripts/benchmark.ts (benchmark separated from tests) |
| `src/Api/Strategies/twoMinusOneLines.ts` | src/core/strategies/twoMinusOneLines.ts |
| `src/Api/Strategies/twoStringKite.ts` | src/core/strategies/twoStringKite.ts |
| `src/Api/Strategies/updateCandidates.ts` | src/core/strategies/updateCandidates.ts |
| `src/Api/Strategies/wWing.ts` | src/core/strategies/wWing.ts |
| `src/Api/Strategies/xWing.ts` | src/core/strategies/xWing.ts |
| `src/Api/Strategies/xyChain.ts` | src/core/strategies/xyChain.ts |
| `src/Api/Strategies/xyLoop.ts` | src/core/strategies/xyLoop.ts |
| `src/Api/Strategies/xyzWing.ts` | src/core/strategies/xyzWing.ts |
| `src/Api/Strategies/yWing.ts` | src/core/strategies/yWing.ts |
| `src/Api/Types.ts` | src/core/types.ts |
| `src/Api/Utils.dependent.ts` | src/core/annotations.ts |
| `src/Api/Utils.test.ts` | src/core/geometry.test.ts |
| `src/Api/Utils.ts` | src/core/geometry.ts |
| `src/Api/boards.ts` | src/core/fixtures.ts |
| `src/Api/mtBoards.ts` | src/core/benchmark-boards.ts |
| `src/App.css` | src/App.css; src/components/*.css |
| `src/App.test.tsx` | src/App.test.ts; e2e/solver.spec.ts |
| `src/App.tsx` | src/App.svelte; src/workspace.svelte.ts |
| `src/Elems/Aside.css` | src/components/Tools.css |
| `src/Elems/Aside.test.tsx` | src/App.test.ts; e2e/solver.spec.ts |
| `src/Elems/Aside.tsx` | src/components/Tools.svelte; src/core/catalog.ts |
| `src/Elems/AsideElems/SolverPart.tsx` | src/components/Tools.svelte; src/core/catalog.ts |
| `src/Elems/AsideElems/StrategyControl.tsx` | src/components/Tools.svelte; src/core/catalog.ts |
| `src/Elems/AsideElems/StrategyControls.tsx` | src/components/Tools.svelte; src/core/catalog.ts |
| `src/Elems/AsideElems/StrategyDetails.css` | src/components/Tools.css |
| `src/Elems/AsideElems/StrategyDetails.tsx` | src/components/Tools.svelte; src/core/catalog.ts |
| `src/Elems/AsideElems/StrategyItem.css` | src/components/Tools.css |
| `src/Elems/AsideElems/StrategyItem.tsx` | src/components/Tools.svelte; src/core/catalog.ts |
| `src/Elems/AsideElems/StrategyLabel.tsx` | src/components/Tools.svelte; src/core/catalog.ts |
| `src/Elems/AsideElems/StrategyList.css` | src/components/Tools.css |
| `src/Elems/AsideElems/StrategyList.tsx` | src/components/Tools.svelte; src/core/catalog.ts |
| `src/Elems/AsideElems/StrategyStatus.tsx` | src/components/Tools.svelte; src/core/catalog.ts |
| `src/Elems/AsideElems/StrategyToggler.tsx` | src/components/Tools.svelte; src/core/catalog.ts |
| `src/Elems/AsideElems/Tab.tsx` | src/components/Tools.svelte; src/core/catalog.ts |
| `src/Elems/AsideElems/Tabs.css` | src/components/Tools.css |
| `src/Elems/AsideElems/Tabs.test.tsx` | src/App.test.ts; e2e/solver.spec.ts |
| `src/Elems/AsideElems/Tabs.tsx` | src/components/Tools.svelte; src/core/catalog.ts |
| `src/Elems/Control.tsx` | src/components/Tools.svelte; src/components/TransferDialog.svelte |
| `src/Elems/ExternalLink.test.tsx` | src/App.test.ts; e2e/solver.spec.ts (rendered links) |
| `src/Elems/ExternalLink.tsx` | src/components/ExternalLink.svelte |
| `src/Elems/GithubCorner.css` | src/components/GithubCorner.css |
| `src/Elems/GithubCorner.tsx` | src/components/GithubCorner.svelte |
| `src/Elems/Main.css` | src/components/Board.css |
| `src/Elems/Main.tsx` | src/components/Board.svelte; src/workspace.svelte.ts |
| `src/Elems/MainElems/Candidate.css` | src/components/Cell.svelte; src/components/Cell.css; src/components/Annotations.css |
| `src/Elems/MainElems/Candidate.tsx` | src/components/Cell.svelte; src/components/Cell.css; src/components/Annotations.css |
| `src/Elems/MainElems/Candidates.css` | src/components/Cell.svelte; src/components/Cell.css; src/components/Annotations.css |
| `src/Elems/MainElems/Candidates.tsx` | src/components/Cell.svelte; src/components/Cell.css; src/components/Annotations.css |
| `src/Elems/MainElems/CandidatesDiff.tsx` | src/components/Cell.svelte; src/components/Cell.css; src/components/Annotations.css |
| `src/Elems/MainElems/Cell.tsx` | src/components/Cell.svelte; src/workspace.svelte.ts |
| `src/Elems/MainElems/Row.tsx` | src/components/Board.svelte |
| `src/Elems/MainElems/Sudoku.css` | src/components/Board.css |
| `src/Elems/MainElems/Sudoku.md` | README.md (keyboard table); docs/svelte-rewrite.md |
| `src/Elems/MainElems/Sudoku.test.tsx` | src/App.test.ts; e2e/solver.spec.ts |
| `src/Elems/MainElems/Sudoku.testUtils.ts` | src/App.test.ts; e2e/solver.spec.ts |
| `src/Elems/MainElems/Sudoku.tsx` | src/components/Board.svelte |
| `src/Elems/NoticeElems/AlertNotice.css` | src/App.svelte; src/App.css (inline status and boundary) |
| `src/Elems/NoticeElems/AlertNotice.tsx` | src/App.svelte; src/App.css (inline status and boundary) |
| `src/Elems/NoticeElems/NoticeWindow.tsx` | src/App.svelte; src/App.css (inline status and boundary) |
| `src/Elems/NoticeElems/PromptWindow.css` | src/components/TransferDialog.svelte; src/components/TransferDialog.css |
| `src/Elems/NoticeElems/PromptWindow.tsx` | src/components/TransferDialog.svelte; src/components/TransferDialog.css |
| `src/Elems/StaticComponent.tsx` | Retired; ordinary Svelte components and derived state |
| `src/Elems/Title.tsx` | src/App.svelte |
| `src/Elems/Version.tsx` | src/App.svelte (package version at build time) |
| `src/ErrorNotice.css` | src/App.css (failure notice) |
| `src/ErrorNotice.tsx` | src/App.svelte (Svelte boundary) |
| `src/Types.tsx` | src/core/types.ts; local component Props types |
| `src/asyncPrompt.ts` | src/components/TransferDialog.svelte (native dialog) |
| `src/deprecate.test.ts` | Retired with obsolete migration helper |
| `src/deprecate.ts` | Retired; obsolete migration helper |
| `src/eventRegistry.ts` | Retired; declarative Svelte handlers and onDestroy cleanup |
| `src/general.test.tsx` | src/App.test.ts; src/core/session.test.ts |
| `src/index.css` | src/App.css |
| `src/index.tsx` | src/main.ts |
| `src/keyboardListener.test.ts` | src/App.test.ts; e2e/solver.spec.ts |
| `src/keyboardListener.ts` | src/components/Board.svelte; src/workspace.svelte.ts |
| `src/logo.svg` | Retired; unused starter asset |
| `src/react-app-env.d.ts` | tsconfig.json (vite/client types) |
| `src/reportWebVitals.ts` | Retired unused helper; docs/development.md links performance guidance |
| `src/setupTests.ts` | src/App.test.ts (local dialog stubs); vite.config.ts (test configuration) |
| `src/testUtils.ts` | src/core/strategies/strategies.test.ts; src/App.test.ts (local helpers) |
| `src/utils.test.ts` | src/core/geometry.test.ts; src/core/session.test.ts |
| `src/utils.ts` | src/core/geometry.ts; src/core/session.ts (helpers kept with consumers) |

Build/configuration mapping:

| Old file or mechanism | Replacement |
| --- | --- |
| CRA / `react-scripts` | `vite.config.ts`; `svelte.config.js`; `index.html` |
| `.eslintrc` | `eslint.config.js`; `.prettierrc.json`; `.editorconfig` |
| `yarn.lock` | `package-lock.json` and `npm ci` |
| `tsconfig.json` | `tsconfig.json` (Svelte files, ESNext language/types) |
| `.github/workflows/build.yml` | Same path; npm, lint/format, Node matrix and browser tests |
| React render synchronization | `core/session.ts` snapshots and `solver-runner.ts` worker transport |
| Component mutation/color registration | `core/marks.ts`; `core/annotations.ts`; `core/explanations.ts` |
| Physical-keyboard-only candidate entry | `components/CandidatePad.svelte` supplements existing keyboard handlers |
| Core-only coverage | `vite.config.ts` includes application state and Svelte components |

Historical research, changelog, license and repository metadata remain in place.

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
