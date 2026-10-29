# Legacy comment audit

Compared the old PR base `5f586e18b675826e8069a1b72a9518070b22b029` with the
rewrite after `694130c`, including the serializer/comment changes in this pass.
The scope is all 129 tracked authored files outside the vendored `.yarn/` tree
and dependency lockfile: source, tests, styles, HTML, configuration and generators.
Unchanged Markdown documents remain available in the repository.

The inventory contains **972** old comment blocks or individual line comments.
TypeScript/JavaScript/JSON comments were collected from syntax-node trivia, CSS
and HTML from comment delimiters, Python with `tokenize` (including inline
comments), and configuration comments from comment lines. Text matching ignores
comment delimiters and whitespace. It found 506 comment texts still present in
code and 20 in Markdown; the other 446 were inspected for transferable meaning.
These are inventory units, not a count of independent ideas, and text matches
alone do not establish that the surrounding behavior is unchanged.

## Useful intent restored or adapted

| Old source                                     | Retained intent                                                                                            | Current location                                                                                             |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `src/Api/Solver.ts`                            | Failed/skippable strategy state differs from a user-disabled strategy                                      | `src/core/session.ts`                                                                                        |
| `src/Elems/MainElems/Cell.tsx`                 | An untouched all-nine cell starts a fresh entry instead of subtracting its first typed digit               | `src/workspace.svelte.ts`                                                                                    |
| `src/Elems/MainElems/Cell.tsx`                 | Candidate reasoning can require the 3×3 view even for a solved cell; unfocused all-nine cells appear blank | `src/components/Cell.svelte`                                                                                 |
| `src/Elems/MainElems/Sudoku.tsx`               | Combining held arrow keys only on repeat prevents replaying a fresh keypress                               | `src/components/Board.svelte`                                                                                |
| `src/Elems/MainElems/Sudoku.tsx` and its tests | The grid cell and its focusable inner button have separate semantic jobs                                   | `src/components/Board.svelte`                                                                                |
| `src/Elems/Aside.tsx`                          | Puzzle controls are directly related content, represented as a section                                     | `src/components/Tools.svelte`                                                                                |
| `src/Elems/AsideElems/Tabs.tsx`                | Tab enters on the selected tab; arrow navigation aligns focus and selection                                | `src/components/Tools.svelte`                                                                                |
| `src/Elems/AsideElems/StrategyItem.tsx`        | Rows contain interactive descendants; they are list items rather than listbox options                      | `src/components/Tools.svelte`                                                                                |
| `src/Elems/AsideElems/StrategyItem.css`        | Reserve status/control space independently of wrapping strategy names                                      | `src/components/Tools.css`                                                                                   |
| `src/Elems/AsideElems/StrategyStatus.tsx`      | Avoid a separate live announcement for every strategy row                                                  | `src/App.svelte`                                                                                             |
| `src/Elems/Version.tsx`                        | Keep the visible version and package version consistent                                                    | `src/App.svelte`                                                                                             |
| `src/utils.ts` / `src/Elems/ExternalLink.tsx`  | Link clicks should not also activate containing controls                                                   | `src/components/ExternalLink.svelte`                                                                         |
| `src/Api/Utils.dependent.ts`                   | Removing candidates from a group returns a change flag, not an elimination count                           | `src/core/annotations.ts`                                                                                    |
| `src/Api/Utils.dependent.ts` / candidate CSS   | Color marks accumulate; CSS decides overlap precedence; blended and softer cell fills have a purpose       | `src/core/annotations.ts`, `src/components/Annotations.css`                                                  |
| `src/utils.ts`                                 | English-list punctuation and examples are worth documenting, while empty input throws                      | `src/core/text.ts`                                                                                           |
| `src/Api/Strategies/timeStrategies.test.ts`    | Earlier strategies can keep later strategies from being exercised by ordinary corpus runs                  | `scripts/benchmark.ts`                                                                                       |
| CI / `.gitignore` / HTML template              | Preserve investigation starting points using current tools rather than CRA-specific instructions           | Workflow release-schedule link, ignore-pattern reference, root HTML module-entry comment, `public/README.md` |

Stale `Cell#highlight` and `Utils` references in retained strategy comments now
point to `Board.mark` and geometry. The `id()` cache comment additionally makes the retained geometry/Set identity
requirement explicit at its implementation. Mathematical strategy explanations,
algorithm examples, fixture provenance and useful utility contracts already
present in the rewrite were kept.

## Useful history that should not become misleading code comments

- The old React mount registry, imperative Cell mutation, `setState` queue,
  custom alert/prompt queue, reference binding and ad-hoc render-wait mechanisms
  describe retired implementations. Their replacements are explained in
  `svelte-rewrite.md`; copying their implementation instructions would be wrong.
- Old `pretend`/`explaining` field descriptions are adapted to `fresh`, `previous`
  and annotations, rather than suggesting those old fields still exist.
- Old comments disagree with current implemented Backspace behavior and include
  completed navigation/selection TODOs. Current help/tests describe the behavior.
- Shift-range selection and a possible roving-tabindex grid remain future ideas;
  they are noted in the keyboard documentation rather than presented as features.
- The old row-wide toggle hit area was an intentional usability goal. The current
  strategy name is a learning link and the switch has its own accessible name;
  enlarging the switch hit area remains a useful touch-usability review item.
- The old orange/green/blue priority list is not copied as a universal rule:
  combined selectors and candidate diffs affect actual CSS precedence.
- Old absolute checkbox coordinates, border-size algebra, historical Chrome
  `max()` observations and removed sanitize.css interactions depend on a layout
  that no longer exists. Current grid/border responsibilities are documented
  beside the replacement rules.
- Disabled code, speculative TODOs about removed functions, old lint suppressions,
  obsolete TypeScript/React workarounds and CRA-only starter examples are not
  active documentation for the new architecture. Existing references and credits
  were preserved or updated instead.

## File coverage

The following inventory lists every old file that contains comments. Files without
comments were included in the scan but have nothing to transfer. “Old comments”
counts blocks/line comments; all comments in unchanged generators remain intact.

| Old file                                           | Old comments |
| -------------------------------------------------- | -----------: |
| `.eslintrc`                                        |           15 |
| `.github/workflows/build.yml`                      |            2 |
| `.gitignore`                                       |            8 |
| `public/index.html`                                |            4 |
| `public/robots.txt`                                |            1 |
| `src/Api/Solver.test.tsx`                          |            4 |
| `src/Api/Solver.ts`                                |           38 |
| `src/Api/Spaces/PureSudoku.test.ts`                |            1 |
| `src/Api/Spaces/PureSudoku.ts`                     |           16 |
| `src/Api/Spaces/Sudoku.ts`                         |            4 |
| `src/Api/Strategies/Strategies.test.tsx`           |           33 |
| `src/Api/Strategies/Strategies.ts`                 |            1 |
| `src/Api/Strategies/checkForSolved.ts`             |            1 |
| `src/Api/Strategies/checkValidity.test.ts`         |            1 |
| `src/Api/Strategies/checkValidity.ts`              |            4 |
| `src/Api/Strategies/fish.ts`                       |           11 |
| `src/Api/Strategies/hiddenPairsTriplesAndQuads.ts` |           26 |
| `src/Api/Strategies/hiddenSingles.ts`              |            4 |
| `src/Api/Strategies/intersectionRemoval.ts`        |            7 |
| `src/Api/Strategies/jellyfish.ts`                  |            1 |
| `src/Api/Strategies/pairCoversGroup.ts`            |           32 |
| `src/Api/Strategies/pairsTriplesAndQuads.ts`       |           23 |
| `src/Api/Strategies/skyscraper.ts`                 |            4 |
| `src/Api/Strategies/swordfish.ts`                  |            1 |
| `src/Api/Strategies/timeStrategies.test.ts`        |           21 |
| `src/Api/Strategies/twoMinusOneLines.ts`           |           10 |
| `src/Api/Strategies/twoStringKite.ts`              |            6 |
| `src/Api/Strategies/updateCandidates.ts`           |            9 |
| `src/Api/Strategies/wWing.ts`                      |            6 |
| `src/Api/Strategies/xWing.ts`                      |            1 |
| `src/Api/Strategies/xyChain.ts`                    |           11 |
| `src/Api/Strategies/xyLoop.ts`                     |           11 |
| `src/Api/Strategies/xyzWing.ts`                    |           17 |
| `src/Api/Strategies/yWing.ts`                      |            8 |
| `src/Api/Types.ts`                                 |            3 |
| `src/Api/Utils.dependent.ts`                       |            8 |
| `src/Api/Utils.test.ts`                            |            6 |
| `src/Api/Utils.ts`                                 |           33 |
| `src/Api/boards.ts`                                |            5 |
| `src/Api/mtBoards.ts`                              |            1 |
| `src/App.css`                                      |           19 |
| `src/App.test.tsx`                                 |           12 |
| `src/App.tsx`                                      |           10 |
| `src/Elems/Aside.test.tsx`                         |            3 |
| `src/Elems/Aside.tsx`                              |            3 |
| `src/Elems/AsideElems/SolverPart.tsx`              |            2 |
| `src/Elems/AsideElems/StrategyControl.tsx`         |            1 |
| `src/Elems/AsideElems/StrategyControls.tsx`        |            1 |
| `src/Elems/AsideElems/StrategyItem.css`            |           13 |
| `src/Elems/AsideElems/StrategyItem.tsx`            |            8 |
| `src/Elems/AsideElems/StrategyLabel.tsx`           |            2 |
| `src/Elems/AsideElems/StrategyList.css`            |            4 |
| `src/Elems/AsideElems/StrategyList.tsx`            |            1 |
| `src/Elems/AsideElems/StrategyStatus.tsx`          |            2 |
| `src/Elems/AsideElems/StrategyToggler.tsx`         |            4 |
| `src/Elems/AsideElems/Tabs.test.tsx`               |            6 |
| `src/Elems/AsideElems/Tabs.tsx`                    |            8 |
| `src/Elems/Control.tsx`                            |            3 |
| `src/Elems/ExternalLink.test.tsx`                  |            3 |
| `src/Elems/ExternalLink.tsx`                       |            1 |
| `src/Elems/GithubCorner.tsx`                       |            2 |
| `src/Elems/Main.css`                               |            2 |
| `src/Elems/Main.tsx`                               |            1 |
| `src/Elems/MainElems/Candidate.css`                |            3 |
| `src/Elems/MainElems/Candidate.tsx`                |            1 |
| `src/Elems/MainElems/Candidates.css`               |            3 |
| `src/Elems/MainElems/Candidates.tsx`               |            3 |
| `src/Elems/MainElems/CandidatesDiff.tsx`           |            2 |
| `src/Elems/MainElems/Cell.tsx`                     |           53 |
| `src/Elems/MainElems/Row.tsx`                      |            1 |
| `src/Elems/MainElems/Sudoku.css`                   |           10 |
| `src/Elems/MainElems/Sudoku.test.tsx`              |           46 |
| `src/Elems/MainElems/Sudoku.testUtils.ts`          |            1 |
| `src/Elems/MainElems/Sudoku.tsx`                   |           41 |
| `src/Elems/NoticeElems/AlertNotice.css`            |            2 |
| `src/Elems/NoticeElems/NoticeWindow.tsx`           |            2 |
| `src/Elems/NoticeElems/PromptWindow.css`           |            2 |
| `src/Elems/NoticeElems/PromptWindow.tsx`           |            4 |
| `src/Elems/Title.tsx`                              |            1 |
| `src/Elems/Version.tsx`                            |            1 |
| `src/Types.tsx`                                    |           20 |
| `src/deprecate.test.ts`                            |            4 |
| `src/deprecate.ts`                                 |            3 |
| `src/eventRegistry.ts`                             |            1 |
| `src/index.css`                                    |            2 |
| `src/index.tsx`                                    |            8 |
| `src/keyboardListener.ts`                          |            2 |
| `src/react-app-env.d.ts`                           |            1 |
| `src/reportWebVitals.ts`                           |            1 |
| `src/setupTests.ts`                                |            4 |
| `src/testUtils.ts`                                 |            3 |
| `src/utils.ts`                                     |           26 |
| `sudokuGenerator.py`                               |          100 |
| `sudokuGenerator2.py`                              |          112 |
