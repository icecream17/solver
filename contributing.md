# Contributing

## Setup

How to start development:

Install the tools listed at: <https://rustwasm.github.io/docs/book/game-of-life/setup.html>

### Useful commands

1. `rustup default stable` - use stable version by default
1. `rustup update` - update rust

## Build

`wasm-pack build`

## Advice

The logical API in `src/` should not depend on the UI/UX code in `www/`.
