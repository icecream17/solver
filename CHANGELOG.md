# Changelog

Note: Many earlier versions are not specified, that's too much work.

When a `@types` dependency updates, they almost always don't affect anything.

## v0.17.1

- (AAA) Oops, X wing absolutely explodes example 2. Fixed that

## v0.17.0

- (use) Add X wing strategy

- (a11y) Remove `aria-checked` from StrategyToggler since `checked` is already there
- (code) Simplify the `Strategy` type
- (code) Extract `getCandidateLocations` from `intersectionRemoval.ts` to `PureSudoku.ts`
- (docs) More stuff added/fixed in Strategies.md
- (deps) Bump @types/node to 16.4.7

## v0.16.2

Dependency bumps

## v0.16.1

- (use) Expand times when strategies are skippable

- (deps) Bump @types/node from 16.4.0 to 16.4.1

## v0.16.0

- (use) Intersection Removal strategy
  - It was easier than doing pointing pairs and box/line reduction separately
- (failsafe) showCandidates if some are eliminated, even if `Cell#state.showCandidates` is false

- (deps) Bump @types/node from 16.3.3 to 16.4.0

## v0.15.1

- (css + use) Fix invalid css (typo).
  - `prefers-reduced-motion` in github corner is `reduce` not `reduced`
- (code) Apply second simplification in Notes.md - `INDICES_TO_NINE`

## v0.15.0

- (use) After "Check for solved" fails, skip "Update candidates"
- (use) If n candidates must appear in \<n cells, ERROR
  - (bug) The current error system is really bad
- (use) Fix bug in hiddenParisTriplesAndQuads
- (tests) Test cases where there's an error

## v0.14.1

- (code) Comment out unused function `forComponentsToStopUpdating`
- (tests) Check that `_expect` throws

## v0.14.0

Big changes:

- (layout + use) Add *hidden* pairs, triples, and quads
- (layout) Add the word `and` to "Pairs, triples, and quads"
- (layout + bugfix) When clearing, explaining = false

Medium changes:

- (docs) More docs for pairs, triples, and quads
- (code) Extract `eliminateUsingConjugateGroups` and pairs, triples, and quads

## v0.13.2

- (tests) Found a bug in the hiddenSingles false positive test
- (tests) Add tests for empty boards

## v0.13.1

- (tests) The "Click everything" test now works!
- (docs) Updated method names
  - (code) `whenCellMounts` and `whenCellUnmounts` instead of `updateFromCell`
  - (code) `addCell` and `removeCell` instead of `updateFromCell`
- (code) Handle unmounting properly
  - (code) StrategyItem also checks `solver.latestStrategyItem`
  - What happens when you exit out the tab isn't too important.
  - But ok, fine.
- (code) Solver cells can now be undefined or null
- (code) Is again slightly more complicated

## v0.13.0

Major changes:

- (use) Undo is implemented!
- (use / layout) Add css class for eliminated/added candidates when explaining a strategy
- (code) Add `Cell#state.explaining` and `Cell#state.previousCandidates`
- (code) Add `CandidatesDiff`
- (code) Add `Cell#undo`

Minor changes:

- (docs) Update `Candidates`
- (code) `Cell#updateCandidates` looks worse

## v0.12.0

Major changes:

- (layout) Reduce top margin in one column layout
- (layout) The checkbox/StrategyToggler's height is `--item-height`
- (layout) The StrategyList uses `--item-height` `in padding-left`
- (layout) Remove the `height` css property in `StrategyItem`

Minor changes:

- (deps) Bump @types/node from 16.3.0 to 16.3.1
- (docs) Explain `--cell-fontsize`
- (code) Extract `--item-height`
- (code) Remove the css variables `scaling-factor` and `vertical-padding`
- (code) Move `toggleCandidate` above `render` in `Cell.tsx`
- (code) Move stuff from `StrategyList.css` into `StrategyItem.css`

## v0.11.0

Major changes:

- (layout + use) **Use links instead of tooltips**
  - (code) Replace `description` with `href`, now optional.
  - (layout) If href is not provided, the text will just be a `span`
- (a11y + use) **Different colors** when
  - clicking on a link
  - a link has been visited
- (BUG) The github octobat is a link. And when you've visited it, it turns purple.
- (code) The ExternalLink class is now always added to the existing class,
rather than being just the default class

Minor changes:

- (deps) Bump @types/jest from 26.0.23 to 26.0.24
- (deps) Bump @types/node from 16.0.0 to 16.3.0
- (deps) Bump @types/react from 17.0.13 to 17.0.14
- (deps) Bump @types/react-dom from 17.0.8 to 17.0.9
- (docs) Add docs for the remaining functions in `utils.ts`
- (tests) Test passing `string[]` to `convertArrayToEnglishList`

## v0.10.3

- (deps) Bump @craco/craco from 6.1.2 to 6.2.0
- (deps) Bump babel-plugin-const-enum from 1.0.1 to 1.1.0
- (deps) Bump @types/node from 15.14.0 to 16.0.0
- (docs) Explain `findConjugatesOfGroup` better
- (types) Change `Solver#Step` return type
from `Promise<undefined>` to `Promise<void>`
- (lint) More `.eslintrc` checks

## v0.10.2

- (tests) `Sudoku.test.tsx` Fix that v0.10.0 test *again*

## v0.10.1

- (layout + a11y) Darken the gray used for active cells
- (tests) `Sudoku.test.tsx` Fix the test added in v0.10.0
- (tests) `Sudoku.test.tsx` Test cell content when (unfocused + all candidates)
- (deps) Bump @types/node from 15.12.5 to 15.14.0
- (deps) Bump @types/react from 17.0.12 to 17.0.13
- (deps) Bump web-vitals from 2.0.1 to 2.1.0

## v0.10.0

This is just a cleanup commit.\
The second version number is bumped since version v0.9.0 says v0.10.0 will
start the changelog.

- (docs) **Start the changelog**
- (docs) Removed extra words in the readme's silly dependency note.
- (tests) `Sudoku.test.tsx`: Remove unused stuff
- (tests) `Sudoku.test.tsx`: Test manually toggling all the candidates in
addition to pressing <kbd>Backspace</kbd>
- (code) Remove 2 `Sudoku` methods, which both (!?) get a `Cell` *instance*.\
These methods aren't actually used anywhere
