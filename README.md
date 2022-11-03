# solver

[![codecov](https://codecov.io/gh/icecream17/solver/branch/main/graph/badge.svg?token=FOcsmxUx91)](https://codecov.io/gh/icecream17/solver)
[![build](https://github.com/icecream17/solver/workflows/build/badge.svg)](https://github.com/icecream17/solver/actions)
[![CodeFactor](https://www.codefactor.io/repository/github/icecream17/solver/badge/main)](https://www.codefactor.io/repository/github/icecream17/solver/overview/main)

A simple sudoku solver I made. This is inspired by <https://sudokuwiki.org/>.

## how to install / starting development

[Install node](https://nodejs.org/), it comes with npm.

Try `npm -i npm@latest` to update npm - if there's a "not recognized" error, search stackoverflow about adding node to path.

`npm -i yarn`

`yarn`

Congrats! You've installed all the depedencies!

You can try the current dev code with `yarn start`

## file structure

Hopefully the folders are helpful and the code is clear enough.\
If you have any feedback feel free to post an issue or something.

For example, the actual code is in `src\`, and the strategies are in `src\Api\Strategies`.

### Idea: Separate this repo into 4 packages

1. core / shared stuff
2. sudoku (and related react components)
3. solver api
4. website (all combined together)

Plus, at some point I'd want to support variants: <https://github.com/dclamage/SudokuSolver>

## yarn

This project uses yarn. It's probably also possible to install with npm.

## Silly dependency note

This projects is compatible with its latest dependencies' versions,
though sometimes I didn't bother to make it not compatible with older versions.

And even then, sometimes those dependencies themselves aren't updated.

Current status: `➤ YN0001: No audit suggestions`

You can run `yarn install` and then `yarn npm audit` for the full report.

## Node version

This uses `String.prototype.replaceAll`, so your node version must be `>=15.0.0`.

If you're on gitpod run `nvm install 16` on each new terminal.

Also, `@types/node` is usually on one of the latest versions. If this is incompatible with an earlier version of node, please post an issue.
