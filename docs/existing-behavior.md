# Existing behavior map

This is a **navigation aid for the incremental Svelte 5 migration** (#618), mapping behavior to evidence from the existing implementation.

| Area | Implementation | Existing behavior and evidence |
| --- | --- | --- |
| Board and selection | [Sudoku.tsx](../src/Elems/MainElems/Sudoku.tsx), [Cell.tsx](../src/Elems/MainElems/Cell.tsx) | [Sudoku.test.tsx](../src/Elems/MainElems/Sudoku.test.tsx) checks the labeled grid, focus and selection, and multiple-cell edits. The [keyboard notes](../src/Elems/MainElems/Sudoku.md) contain design ideas as well as descriptions of controls. |
| Candidates and serialization | [PureSudoku.ts](../src/Api/Spaces/PureSudoku.ts) | [PureSudoku.test.ts](../src/Api/Spaces/PureSudoku.test.ts) tests board data. `to81()` represents a solved cell with `1`–`9`, a cell with no candidates with `0`, and other cells with `.`; it appends a newline to each row, including the last. `to729()` records each candidate. |
| Solver progression | [Solver.ts](../src/Api/Solver.ts), [Strategies.ts](../src/Api/Strategies/Strategies.ts) | [Solver.test.tsx](../src/Api/Solver.test.tsx) exercises stepping through strategies, invalid boards, and skipping disabled strategies. |
| Controls and prompts | [StrategyControls.tsx](../src/Elems/AsideElems/StrategyControls.tsx), [App.tsx](../src/App.tsx) | The controls include Clear, Import, Export, Go, Step, and Undo. [App.test.tsx](../src/App.test.tsx) tests alerts and prompts; strategy control testing is marked `test.todo`. |
| Styling | [Sudoku.css](../src/Elems/MainElems/Sudoku.css), [App.css](../src/App.css), [Aside.css](../src/Elems/Aside.css) | These stylesheets define the current board and page presentation. |
