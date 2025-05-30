# Contributing

## Setup

How to start development.

This repository has two parts. Ignoring how `.github/` stores Github Action scripts:
+ The website is in `www/` and contains the UI/UX code.
+ The Solver API (everything else) contains the logic for solving puzzles.

### Solver API

Install the tools listed at: <https://rustwasm.github.io/docs/book/game-of-life/setup.html>

#### Useful commands

1. `rustup default stable` - use stable version by default
1. `rustup update` - update rust
1. `cargo check` - check code (faster than building)
1. `wasm-pack build` - build

### Website

Since the website uses the API as a dependency, the API must be built.

1. `wasm-pack build`
1. `cd www` then `npm install`

Note that you may run into a weird peer dependency error the first time you install,
in that case, inside `www/` run:

1. `rm package-lock.json`
1. `npm install -g yarn`
1. `yarn`
1. `rm yarn.lock`
1. `npm install -D`

And it should magically work.

#### Useful commands

1. `npm outdated -D` - check for outdated dependencies
1. `npm run dev` - start dev server, hot reload
1. `npm build` - build

## Advice

The logical API in `src/` should never depend on the UI/UX code in `www/`.
