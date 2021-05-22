# solver

A simple sudoku solver I made.

## Silly dependency note

This projects uses the latest versions of its dependencies, but those dependencies themselves aren't updated.

In particular, the dependency `react-scripts` depends on outdated versions of `postcss` in 80 different ways. The only reason I know about this is because of `npm audit` which shows security vulnerabilities.

Sigh. Now for some reason the ci is failing, and I need to install `eslint-config-react-app` which depends on `eslint-plugin-testing-library@^3.9.0` even though this project supports `eslint-plugin-testing-library@^4.5.0` (with really corresponds to `4.17.21`). So I'm supporting both.

