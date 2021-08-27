# solver

[![codecov](https://codecov.io/gh/icecream17/solver/branch/main/graph/badge.svg?token=FOcsmxUx91)](https://codecov.io/gh/icecream17/solver)
[![build](https://github.com/icecream17/solver/workflows/build/badge.svg)](https://github.com/icecream17/solver/actions)
[![CodeFactor](https://www.codefactor.io/repository/github/icecream17/solver/badge/main)](https://www.codefactor.io/repository/github/icecream17/solver/overview/main)

A simple sudoku solver I made. This is inspired by <https://sudokuwiki.org/>

## Silly dependency note

This projects is compatible with its latest dependencies' versions,
though sometimes I didn't bother to make it not compatible with older versions.

And even then, those dependencies themselves aren't updated.

Current status: `102 vulnerabilities (5 low, 89 moderate, 8 high)`

You can run `npm install` and then `npm audit` for the full report.

## Slightly less silly dependency note

__The typescript version is still 4.2.4__. See <https://github.com/facebook/create-react-app/issues/11022>

(I know package.json says 4.4.2 or something, but better typing doesn't hurt. I just cant use syntax features.)

## Also

This uses `String.prototype.replaceAll`, so your node version must be `>=15.0.0`. In gitpod do `nvm install 16` on each new terminal.
