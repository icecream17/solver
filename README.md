# Sudoku solver

[![build](https://github.com/icecream17/solver/workflows/build/badge.svg)](https://github.com/icecream17/solver/actions)
[![codecov](https://codecov.io/gh/icecream17/solver/branch/main/graph/badge.svg)](https://codecov.io/gh/icecream17/solver)

A Sudoku solver with editable candidates and step-by-step human solving strategies,
inspired by [SudokuWiki](https://sudokuwiki.org/). Built with Svelte 5, TypeScript,
and Vite. The solver also runs without a DOM.

## Usage

Select a cell and type digits to toggle candidates. The first digit in an untouched
cell starts a new entry. On touch screens, use the candidate buttons below the board.

| Action                                | Keyboard or pointer                                            |
| ------------------------------------- | -------------------------------------------------------------- |
| Toggle a candidate                    | <kbd>1</kbd>–<kbd>9</kbd>                                      |
| Reset to all candidates               | <kbd>Backspace</kbd>                                           |
| Remove all candidates                 | <kbd>Ctrl</kbd>/<kbd>Shift</kbd> + <kbd>Backspace</kbd>        |
| Select several cells                  | <kbd>Ctrl</kbd> + click                                        |
| Select all / deselect                 | <kbd>Ctrl</kbd> + <kbd>A</kbd> / <kbd>Escape</kbd>             |
| Move between cells, wrapping at edges | Arrow keys; <kbd>Tab</kbd> / <kbd>Shift</kbd> + <kbd>Tab</kbd> |
| First / last cell in row              | <kbd>Home</kbd> / <kbd>End</kbd>                               |
| First / last cell on board            | <kbd>Ctrl</kbd> + <kbd>Home</kbd> / <kbd>End</kbd>             |
| Move three rows                       | <kbd>Page Up</kbd> / <kbd>Page Down</kbd>                      |
| Undo                                  | <kbd>Ctrl</kbd> + <kbd>Z</kbd>                                 |

<kbd>Command</kbd> also works for <kbd>Ctrl</kbd> shortcuts on macOS.

The **Solving tools** tab imports puzzles and exports both digits and candidates.
Import accepts 81-cell puzzles, 729-character candidate strings, candidate grids,
and SudokuWiki URLs. Candidate export is lossless. In digit export, a dot means
unsolved; a zero exports an empty candidate set but imports as a blank, matching
the original app.

The **Strategies** tab offers Step (one strategy), Go (until a strategy succeeds or
the pass ends), strategy switches, result counts, and explanations. Removed digits
are struck through; the explanation lists changes and reasoning in text as well as
colors. Cancel stops a long search without changing the board. Undo retains the last
100 board edits or solver commands. This human-strategy solver can stall; it does
not guess or support variants.

## Code

Install [Node.js](https://nodejs.org/) 22.22.2+, 24.15.0+, or 26+ within the
supported major ranges in `package.json`. CI checks the minimum and Node 24.
Run `npm ci`, then `npm run dev` to start development.

- Development: `npm run dev` (also `npm start`).
   - Production preview: `npm run build`, then `npm run preview`.
- Static checks: `npm run lint`, `npm run format`, and `npm run check`.
   - Apply style fixes: `npm run lint:fix`, then `npm run format:write`.
- Unit and component tests: `npm test`.
   - Watch: `npm run test:watch`; coverage: `npm run test:coverage`.
- Browser tests: `npx playwright install chromium firefox webkit`, then `npm run test:e2e`.
- Benchmark: `npm run bench -- 100`; use `1465` for the full corpus (default: 50).

The solver lives in [`src/core/`](src/core/), reactive application state in
[`src/workspace.svelte.ts`](src/workspace.svelte.ts), and UI in
[`src/components/`](src/components/). See [development guidance](docs/development.md)
for testing, lint rules, build and deployment references; [rewrite notes](docs/svelte-rewrite.md)
for architecture, feature parity, and the old-to-new file table;
and [strategy notes](Strategies.md) for historical research.
