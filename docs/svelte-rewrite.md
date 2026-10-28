# Svelte 5 rewrite

The UI, state ownership, solver orchestration, dialogs, keyboard handlers, build,
and browser tests were rebuilt around Svelte 5 and Vite. The mathematical strategy
implementations and puzzle fixtures were ported from the original project rather
than rederived. They are now independent of React, components, and browser globals.

## Architecture

- `src/core/board.ts` owns the working board used during a strategy.
- `src/core/strategies/` contains all 18 original strategies in their original order.
- `src/core/annotations.ts` records cell/candidate colors as plain data.
- `src/core/session.ts` implements synchronous Step/Go operations on snapshots.
  It returns a new session and rolls back a strategy if it leaves a contradiction.
- `src/workspace.svelte.ts` owns the Svelte reactive boundary, selection, and undo.
- `src/components/` renders data and sends user actions upward. Components never
  register themselves with the solver. The solver never waits for rendering.

## Feature parity

| Original capability | Rewrite |
| --- | --- |
| Candidate entry/toggling and untouched-cell first entry | Preserved |
| Clear candidates or reset to all nine | Preserved, including Ctrl/Shift modifiers |
| Active/inactive selection and Ctrl multiselection | Preserved |
| Ctrl+A, Escape, Tab, wrapping arrows | Preserved |
| Home/End, Ctrl+Home/End, Page Up/Down, held-key movement | Preserved |
| 81-cell, 729-character, candidate-grid, SudokuWiki URL import | Preserved |
| Both export formats | Shown together in a native dialog |
| Step and Go | Preserved: Go stops at a successful strategy/end of a pass |
| All 18 strategies, order, learning links, toggles, result counts | Preserved |
| Candidate diffs and cell/candidate explanation colors | Preserved |
| Undo | Expanded to a bounded 100-action history, including edits/import/clear |
| Notices, validation errors, completion message | Inline live status; no global alert queue |
| Render error notice and retry | Svelte boundary with report link and retry |
| Keyboard tabs and modal focus | Native controls, keyboard tabs, native modal focus trap |
| Dark palette, cyan links, monospace grid, responsive two-column layout | Preserved |
| Right-to-left layout and printing | Logical borders/spacing and print stylesheet |
| GitHub Pages | Vite relative asset paths; main-only deployment |
| Strategy correctness fixtures | Ported to Vitest, with no rendered app required |

## Deliberate behavior improvements

Invalid imports leave the current board untouched and explain the accepted formats.
Strategy toggles and results survive tab changes. Errors cannot leave a partially
mutated board. Undo restores the solver cursor along with board/explanation state.
Losing window focus clears held keys. macOS Command shortcuts are supported too.

The solver remains a human-strategy solver: it can stop without finishing a puzzle.
It does not silently fall back to guessing. The rewrite does not add Sudoku variants.

## Verification

`npm run check`, `npm test`, `npm run test:coverage`, and `npm run build` validate
types, Svelte diagnostics, core fixtures, component interactions, and production compilation.
The Svelte interaction tests run in jsdom; native modal behavior and layout require
the browser suite. `npm run
test:e2e` tests the production build in desktop and mobile Chromium, including
editing, selection, navigation, transfer dialogs, explanations, undo, and toggles.
The mobile project verifies viewport layout and pointer/keyboard behavior; it is
not a real iOS Safari compatibility test. `npm run bench -- 100` measures solving
on the existing benchmark corpus without UI overhead.

## Local verification record

- Type checking and Svelte diagnostics: no errors or warnings.
- Vitest: 124 passing tests, including 13 Svelte interaction tests.
- Core line coverage: 97.21% with V8 coverage.
- Production build: 29.17 KB JavaScript and 2.23 KB CSS, gzipped, including all strategies.
- Production source: 3,758 lines across 37 files versus 6,889 across 83 files before
  the rewrite (TS/TSX/Svelte/CSS, excluding tests and puzzle datasets).
- Full existing corpus: 1,465 puzzles, 496 solved, 969 stalled, zero solver errors;
  about 13.9 seconds total in this environment. Stalled puzzles are expected with
  the current human-strategy catalog.
- Local Playwright execution was blocked by Chromium exiting with SIGTRAP before
  loading a page. Desktop/mobile browser tests are included in CI; native dialog
  focus, actual viewport layout, and browser rendering still need that check.
