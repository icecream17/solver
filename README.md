# Sudoku solver

A Sudoku solver with editable candidates and step-by-step human solving strategies.
Built with Svelte 5, TypeScript, and Vite. The core solver runs without a DOM.

## Development

Requires Node.js 22.12+ (Node 24 is used in CI).

```sh
npm ci
npm run dev
```

## Checks

```sh
npm run check
npm test
npm run test:coverage
npm run build
npx playwright install chromium
npm run test:e2e
npm run bench -- 100
```

`npm run test:watch` watches unit tests. `npm run preview` serves the production
build. Vite writes `dist/` with relative asset paths for GitHub Pages.

## Usage

Select a cell and type digits to toggle candidates. The first digit in an untouched
cell starts a new entry. Backspace resets to all candidates; Ctrl/Shift+Backspace
removes all candidates. Ctrl+click selects multiple cells, Ctrl+A selects all,
and Escape deselects. Arrows wrap, Home/End navigate a row, Ctrl+Home/End navigate
the board, and Page Up/Down move three rows. Command also works on macOS.

Import accepts 81-cell puzzles, 729-character candidate strings, whitespace-separated
candidate grids, and SudokuWiki URLs. Export includes both digits and candidates.
The candidate format is lossless. In the 81-cell format, a dot means unsolved; a zero
exports an empty candidate set but imports as a blank, matching the original app.

The strategies tab offers Step (one strategy), Go (until a strategy succeeds or the
pass ends), Undo, strategy switches, result counts, and explanations. Yellow marks
eliminated candidates, green marks additions, and blue/green/orange show reasoning.
Undo supports the last 100 board edits or solver commands.

## Code

- `src/core/`: board, geometry, strategies, import/export, and headless sessions.
- `src/workspace.svelte.ts`: reactive application state and user actions.
- `src/components/`: Svelte board, cells, tools, and native transfer dialog.
- `e2e/`: production-build browser tests.
- `scripts/benchmark.ts`: benchmark runner using the existing puzzle corpus.

See [the rewrite notes](docs/svelte-rewrite.md) for architecture and feature parity.
Historical strategy notes remain in [Strategies.md](Strategies.md).
