# Development guidance for AI contributors

This file is guidance for AI contributors working on the repository. The
[rewrite notes](svelte-rewrite.md) describe how the systems fit together for review.

Use the commands in the [README](../README.md). Commit `package-lock.json`; CI uses
`npm ci` and an npm cache. Vite serves development files and writes a static `dist/`
with relative asset paths for GitHub Pages. There is no server runtime in production.

## Code boundaries

Keep mathematical strategies and snapshots in `src/core/`, free of components,
Svelte runes, and browser globals. `Workspace` owns selection, edit history, and
reactive state. Components receive data and callbacks. Browser solving uses a fresh
module worker per command; terminating it cancels even a synchronous strategy search.
The operation generation guards against stale results after editing or cancelling.
Always terminate workers during component teardown.

Test strategies with candidate fixtures and exact eliminations. Test state
transitions through Workspace (including undo, toggles, cancellation and stale
results). Component tests use an injected runner, leaving the real core active.
Browser tests exercise the production worker, modal focus, keyboard navigation,
responsive layout, touch entry and cancellation. Chromium, Firefox and WebKit run
on Ubuntu; mobile emulation exercises touch Chromium, not an actual iOS device.
Coverage includes application state, components and the core. Worker entry wiring
is exercised by browser tests rather than jsdom. Do not infer browser compatibility
from jsdom or TypeScript's compilation target.

## Style and static checks

`eslint.config.js` replaces `.eslintrc` with flat config: JavaScript/TypeScript,
Svelte (including accessibility), regular-expression, Sonar, Vitest and Testing
Library checks. React-specific rules are replaced by Svelte rules. The original
choice to avoid algorithm complexity and nesting limits is retained. Narrow rule
exceptions explain false positives beside the code; unused exceptions are errors.

Prettier owns whitespace: three spaces, no semicolons, single quotes, and one
attribute per line. Stylistic ESLint rules put object properties on separate lines.
Run lint fixes before formatting. `.editorconfig` supplies the same indentation.
Separate global formatting changes from behavior changes when reviewing a migration.

Component CSS sits beside the component. `App.css` owns shared layout and controls;
`Annotations.css` owns the cross-component reasoning palette. Keep short comments
around independent responsibilities and preserve useful mathematical explanations.
Use `ExternalLink` for external links so privacy attributes and event behavior agree.

## Build and browser references

- [Svelte 5 runes](https://svelte.dev/docs/svelte/what-are-runes),
  [component props](https://svelte.dev/docs/svelte/$props), and
  [Svelte ESLint setup](https://sveltejs.github.io/eslint-plugin-svelte/user-guide/).
- [Vite development and production](https://vite.dev/guide/) and
  [static deployment](https://vite.dev/guide/static-deploy.html).
- [TypeScript configuration](https://www.typescriptlang.org/tsconfig/): ESNext is
  the language/type target; Vite's build target controls browser output separately.
- [Vitest coverage](https://vitest.dev/guide/coverage.html),
  [Testing Library principles](https://testing-library.com/docs/guiding-principles/),
  and [Playwright tests](https://playwright.dev/docs/writing-tests).
- [Prettier options](https://prettier.io/docs/options) and
  [ESLint flat config](https://eslint.org/docs/latest/use/configure/configuration-files).
- [Public asset guidance](../public/README.md), including robots and favicon files.

CRA-specific commands, webpack configuration, React test setup and the unused
`reportWebVitals` helper are retired. For future performance instrumentation, start
with [Web Vitals](https://web.dev/articles/vitals) and measure a production build;
the headless benchmark measures solver work, not rendering or input latency.

## CI and deployment

The build workflow runs lint, format, type checks, tests/coverage and production
builds on Linux, macOS and Windows, with Node 22.22.2 and 24. Browser tests run once
on Linux/24. Deployment is restricted to `refs/heads/main` and that one matrix job;
a merge or rebase pushed to main and a manual run on main can deploy. PR refs do
not deploy. Dependencies use npm caching and pinned action commits.
