# Changelog

Note: Many earlier versions are not specified, that's too much work.

When a `@types` dependency updates, they almost always don't affect anything.

## v0.24.8

- (use) Useless almost 5 KB save in initial loading!
- (use) This is done by lazyloading strategies. I'm not sure if this is a good change actually.
- (code) Use PureComponent, StaticComponent, separate \_Function and \_Callback

## v0.24.7

- (use) Fix css text direction bug in the Cell and StrategyItem borders
- (use) Use yarn. Fix build

## v0.24.6

- (use) Fix directional bug in xyChain

## v0.24.5

- (a11y) The StrategyItem's are labelled by their text
- (a11y) And so the StrategyToggler are not labelled by their text
  - (a11y) Instead they are labelled by "StrategyTogglerLabel" which isn't highlightable and exists in the same space as the StrategyResult region
  - (use) If you click the StrategyResult region, it toggles.
- (layout) checkboxes are finally aligned correctly
- (layout) Alert boxes finally stay in the bottom right
- (code) Labels and ExternalLink supports the id property

## v0.24.4

- (use) Lazyload PromptWindow / AlertNotice for faster initial loading
- (a11y) Correct tabbing order (Data vs Sudoku) to match visuals.
- (support) Don't ban Opera Mini
- (support) Don't use `Array#at` for chromebook compatibility
- (docs) Update everything

## v0.24.3

- (use) Links like <https://something.something/blahblahlbah?sudoku=123456789123456789123456789123456789123456789123456789123456789123456789123456789> can be imported directly! (As long as there are 81 or 729 digits in the url)
- (css + use) Better printing
- (code) Resolve all circular dependencies except for Solver importing SolverPart, moving a bunch of stuff around
  - This is actually the main change

## v0.24.2

- (use) Extract XY Chain from XY Ring (Loop)
- (use) Export button now sends both an 81 and 729 representation
- (css) Set max width on alert boxes
- (code) Move assertGet, colorGroup, and getCellsWithTwoCandidates to utils

## v0.24.1

- (docs) Wow, my XY Ring implementation is more general than I thought! Nice!
  - (use) In fact, it covers XY Chains!
  - (use) But wait... it's way too general when eliminating in the XY Chain case... oops, fix bug.
- (use) Export button now exports candidates as well

## v0.24.0

- (use) XY Ring (Loop)

## v0.23.1

- (use) Fix highlighting
- (use) Fix link
- (code) New sudokuGenerator.py record

## v0.23.0

- (use) two minus one lines
- (css) fix rtl precedence

## v0.22.1

- (deps) Use CRA 5.0.0-next and remove craco!!! (and @babel/plugin-proposal-logical-assignment-operators)
- (css) Use percentages instead of rem (Possible TODO: Use flex or grid)
- (css + use) Better rtl support
- (css) Attempt to center align checkboxes

## v0.22.0

- (use) Add y wing!
- (code) Implement `sharedInArrays` in utils, simplifying skyscraper even more
- (css) Change `Candidate.green` to `Candidate.solved`, then make actual `Candidate.green`

- (deps) @types/react to 17.0.20
- (deps) @types/node to 16.7.13

## v0.21.2

- (code) Simplify skyscraper
- (use) Fix simplified skyscraper
- (code) Remove Region + RegionLine for now

## v0.21.1

- (use) Move intersection removal before pairs/triples/quads strategies
- (code) Simplify updateCandidates.ts
- (code + use + tests) Don't warn (now error) unless the latestStrategyItem isn't null
  - Basically, if the element is removed (like closing the tab) {especially tests}, don't error.

## v0.21.0

- (use) Add skyscraper (finally)

- (code) Add `src/Api/spaces` folder
- (code) Add Region + RegionLine (hopefully makes things... simpler (and easier))

## v0.20.1

- (docs) Add codefactor badge to readme
- (deps) @types/node to 16.7.1
- (deps) @types/react to 17.0.19

## v0.20.0

- (use) Update skippable on clear, undo, and go
- (use) Color candidate green in hidden singles
- (use) Add export button

- (deps) @types/react to 170.17
- (docs) More Strategy docs
- (tests) Move click everything test to the end
- (other) New sudokuGenerator.py record

## v0.19.1

- (use) Jellyfish

## v0.19.0

- (use) Swordfish!!!!

## v0.18.1

- (use + layout) Add better candidate highlighting for x-wing
- (docs) More ideas

## v0.18.0

- (use + layout) Add better candidate highlighting for every strategy except X wing and hidden singles

## v0.17.3

- (future) Add "classes" and "candidateClasses" to Cell. In the future, strategies will change these classes
- (code) Add Cell#setExplainingToTrue and Cell#setExplainingToFalse

## v0.17.2

- (use) Don't show candidates if zero or nine candidates (fixes clear and undo)

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
