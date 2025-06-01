# solver

[![codecov](https://codecov.io/gh/icecream17/solver/branch/main/graph/badge.svg?token=FOcsmxUx91)](https://codecov.io/gh/icecream17/solver)
[![build](https://github.com/icecream17/solver/workflows/build/badge.svg)](https://github.com/icecream17/solver/actions)
[![CodeFactor](https://www.codefactor.io/repository/github/icecream17/solver/badge/main)](https://www.codefactor.io/repository/github/icecream17/solver/overview/main)

A simple sudoku solver I made. This is inspired by <https://sudokuwiki.org/>.

## how to install / starting development

[Install node](https://nodejs.org/), it comes with npm.

Try `npm -i -g npm@latest` to update npm -- if there's a "not recognized" error, search stackoverflow about adding node to path.

`npm -i -g yarn`

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

There is a mysterious error when compiling:

```
TypeError: Cannot set property mark of #<Object> which has only a getter
    at Object.connectTypeScriptPerformance (.\solver\node_modules\fork-ts-checker-webpack-plugin\lib\typescript-reporter\profile\TypeScriptPerformance.js:12:36)
    at createTypeScriptReporter (.\solver\node_modules\fork-ts-checker-webpack-plugin\lib\typescript-reporter\reporter\TypeScriptReporter.js:40:49)
    at Object.<anonymous> (.\solver\node_modules\fork-ts-checker-webpack-plugin\lib\reporter\rep
```

This is some incompatibility between `create-react-app` > `fork-ts-checker-webpack-plugin` and Typescript 5, but it does
not seem to affect anything. According to Copilot:

> The error occurs in the performance profiling code of the plugin, which is not critical for the actual type-checking process. As a result, the type-checking and build process continue to work correctly despite the error.

## Node version

This project does not seem to use node, but just in case, this uses `Set.prototype.isSubsetOf`, so your node version must be `>=22.0.0`.

Also, `@types/node` is usually on one of the latest versions, since github actions eventually deprecates old versions of node. If `@types/node` is incompatible with an earlier version of node, you can try downgrading the dependency, or post an issue if it doesn't work. Alternatively, if you're on gitpod run `nvm install 16` or higher.
