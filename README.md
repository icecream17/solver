# solver

[![codecov](https://codecov.io/gh/icecream17/solver/branch/main/graph/badge.svg?token=FOcsmxUx91)](https://codecov.io/gh/icecream17/solver)
[![build](https://github.com/icecream17/solver/workflows/build/badge.svg)](https://github.com/icecream17/solver/actions)
[![CodeFactor](https://www.codefactor.io/repository/github/icecream17/solver/badge/main)](https://www.codefactor.io/repository/github/icecream17/solver/overview/main)

A simple sudoku solver I made. This is inspired by <https://sudokuwiki.org/>

## Silly dependency note

This projects is compatible with its latest dependencies' versions,
though sometimes I didn't bother to make it not compatible with older versions.

And even then, those dependencies themselves aren't updated.

Current status: `3 vulnerabilities (3 moderate)`

You can run `npm install` and then `npm audit` for the full report.

## Also

This uses `String.prototype.replaceAll`, so your node version must be `>=15.0.0`. In gitpod do `nvm install 16` on each new terminal.

Until create-react-app uploads a new version with the postcss-normalize fix, I have to use this override in the package.json
