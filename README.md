# solver

[![codecov](https://codecov.io/gh/icecream17/solver/branch/main/graph/badge.svg?token=FOcsmxUx91)](https://codecov.io/gh/icecream17/solver)
[![build](https://github.com/icecream17/solver/workflows/build/badge.svg)](https://github.com/icecream17/solver/actions)

A simple sudoku solver I made. This is inspired by <https://sudokuwiki.org/>

## Silly dependency note

This projects uses the latest versions of its dependencies, but those dependencies themselves aren't updated.

In particular, the dependency `react-scripts` depends on outdated versions of `postcss` in 83 different ways. The only reason I know about this is because of `npm audit` which shows security vulnerabilities. This probably doesn't affect anything. There's also 5 low security vulnerabilities because of prototype pollution in `yargs-parser`, which is required by the chain `yargs < os-locale < eslint-find-rules`. This also probably doesn't affect anything.

Sigh. Now for some reason the ci is failing, and I need to install `eslint-config-react-app` which depends on `eslint-plugin-testing-library@^3.9.0` even though this project supports `eslint-plugin-testing-library@^4.5.0` (with really corresponds to `4.17.21`).\
And then later the build failed for some reason. When I deleted `eslint-plugin-testing-library` it worked. So now the supported version is implicitly `@^3.9.0`.
