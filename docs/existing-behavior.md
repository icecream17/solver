# Existing behavior: starting map

This is a **navigation aid for the incremental Svelte 5 migration** (#618), not a new specification or a claim that the existing behavior is ideal. The **current React app is the reference** until a behavior is explicitly changed in a separate PR. Follow the linked implementation and tests when migrating each piece; do not infer correctness from this document alone.

| Area | Current implementation | Existing evidence / things to check |
| --- | --- | --- |
| Board and selection | [Sudoku.tsx](../src/Elems/MainElems/Sudoku.tsx), [Cell.tsx](../src/Elems/MainElems/Cell.tsx) | [Sudoku.test.tsx](../src/Elems/MainElems/Sudoku.test.tsx) covers a labeled grid, focus/selection and multiple-cell edits. The [keyboard design notes](../src/Elems/MainElems/Sudoku.md) also describe *ideas not necessarily implemented*; verify shortcuts in code. |
| Candidates and serialization | [PureSudoku.ts](../src/Api/Spaces/PureSudoku.ts) | [PureSudoku.test.ts](../src/Api/Spaces/PureSudoku.test.ts) is a starting point. `to81()` uses one character per cell (`1`–`9` solved, `0` no candidates, `.` otherwise), **including a newline after the last row**. `to729()` encodes every candidate. |
| Solver progression | [Solver.ts](../src/Api/Solver.ts), [Strategies.ts](../src/Api/Strategies/Strategies.ts) | [Solver.test.tsx](../src/Api/Solver.test.tsx) checks step progression, a solved/invalid starting point, and skipping a disabled strategy. Inspect the actual strategy order before changing it. |
| Controls / prompts | [StrategyControls.tsx](../src/Elems/AsideElems/StrategyControls.tsx), [App.tsx](../src/App.tsx) | The UI exposes Clear, Import, Export, Go, Step and Undo. [App.test.tsx](../src/App.test.tsx) exercises alerts/prompts, but still contains `test.todo("Strategy control testing")`. |
| Visual presentation | [Sudoku.css](../src/Elems/MainElems/Sudoku.css), [App.css](../src/App.css), [Aside.css](../src/Elems/Aside.css) | Preserve existing layout and informative styling/comments by default; compare the real UI rather than assuming a framework swap is visually neutral. |

## Behaviors to characterize *before* replacing their owners

These are **test gaps or review questions**, not assertions that current `main` is broken:

- Editing a focused cell, Undo, then typing again without leaving it; explicit candidate editing versus first-entry behavior.
- Disabling and re-enabling a solver strategy, especially candidate propagation; no-op solve steps and the next Undo target.
- Keyboard focus after Step/Go; dialog focus restoration; multi-cell selection changes.
- Import/export round trips and exact formatting; annotation/explanation meaning and error specificity.
- Narrow layouts, RTL, print, keyboard-only operation and screen-reader explanations.

See [PR #617](https://github.com/icecream17/solver/pull/617) for **examples of migration risks**, not proof that those bugs exist on `main`. In particular, #617's Svelte code is not the baseline. Add a focused characterization test in its **own PR** before migrating each behavior; if a surprising behavior is found, document what exists and decide separately whether to fix it.

## Scope of this PR

Documentation only: **no code, tests, dependencies, CSS, or build changes**. Future steps can grow this map as they establish evidence. The next planned step in #618 is a focused keyboard-editing regression test.
