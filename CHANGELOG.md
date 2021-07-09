# Changelog

Note: Many earlier versions are not specified, that's too much work.

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
