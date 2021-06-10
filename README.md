# solver

[![codecov](https://codecov.io/gh/icecream17/solver/branch/main/graph/badge.svg?token=FOcsmxUx91)](https://codecov.io/gh/icecream17/solver)
[![build](https://github.com/icecream17/solver/workflows/build/badge.svg)](https://github.com/icecream17/solver/actions)

A simple sudoku solver I made. This is inspired by <https://sudokuwiki.org/>

## Silly dependency note

This projects uses the latest versions of its dependencies, but those dependencies themselves aren't updated.

In particular, the dependency `react-scripts` depends on outdated versions of `postcss` in 84 different ways. The only reason I know about this is because of `npm audit` which shows security vulnerabilities. This probably doesn't affect anything. There's also 5 low security vulnerabilities because of prototype pollution in `yargs-parser`, which is required by the chain `yargs < os-locale < eslint-find-rules`. This also probably doesn't affect anything.

Sigh. Now for some reason the ci is failing, and I need to install `eslint-config-react-app` which depends on `eslint-plugin-testing-library@^3.9.0` even though this project supports `eslint-plugin-testing-library@^4.5.0` (with really corresponds to `4.17.21`).\
And then later the build failed for some reason. When I deleted `eslint-plugin-testing-library` it worked. So now the supported version is implicitly `@^3.9.0`.

Here's the full log:

<details>
<summary>npm audit report</summary>

```shell
# npm audit report

browserslist  4.0.0 - 4.16.4
Severity: moderate
Regular Expression Denial of Service - https://npmjs.com/advisories/1747
fix available via `npm audit fix --force`
Will install react-scripts@1.1.5, which is a breaking change
node_modules/react-dev-utils/node_modules/browserslist
  react-dev-utils  >=6.0.0-next.03604a46
  Depends on vulnerable versions of browserslist
  node_modules/react-dev-utils
    react-scripts  >=0.10.0-alpha.328cb32e
    Depends on vulnerable versions of @pmmmwh/react-refresh-webpack-plugin
    Depends on vulnerable versions of @svgr/webpack
    Depends on vulnerable versions of css-loader
    Depends on vulnerable versions of mini-css-extract-plugin
    Depends on vulnerable versions of react-dev-utils
    Depends on vulnerable versions of resolve-url-loader
    Depends on vulnerable versions of webpack-dev-server
    node_modules/react-scripts
      @craco/craco  <=2.2.3 || >=6.0.0
      Depends on vulnerable versions of react-scripts
      node_modules/@craco/craco

css-what  <5.0.1
Severity: high
Denial of Service - https://npmjs.com/advisories/1754
fix available via `npm audit fix --force`
Will install react-scripts@1.1.5, which is a breaking change
node_modules/css-what
  css-select  <=3.1.2
  Depends on vulnerable versions of css-what
  node_modules/css-select
    renderkid  1.0.0 - 2.0.5
    Depends on vulnerable versions of css-select
    node_modules/renderkid
    svgo  >=1.0.0
    Depends on vulnerable versions of css-select
    node_modules/svgo
      @svgr/plugin-svgo  *
      Depends on vulnerable versions of svgo
      node_modules/@svgr/plugin-svgo
        @svgr/webpack  >=4.0.0
        Depends on vulnerable versions of @svgr/plugin-svgo
        node_modules/@svgr/webpack
          react-scripts  >=0.10.0-alpha.328cb32e
          Depends on vulnerable versions of @pmmmwh/react-refresh-webpack-plugin
          Depends on vulnerable versions of @svgr/webpack
          Depends on vulnerable versions of css-loader
          Depends on vulnerable versions of mini-css-extract-plugin
          Depends on vulnerable versions of react-dev-utils
          Depends on vulnerable versions of resolve-url-loader
          Depends on vulnerable versions of webpack-dev-server
          node_modules/react-scripts
            @craco/craco  <=2.2.3 || >=6.0.0
            Depends on vulnerable versions of react-scripts
            node_modules/@craco/craco
      postcss-svgo  >=4.0.0-nightly.2020.1.9
      Depends on vulnerable versions of postcss
      Depends on vulnerable versions of svgo
      node_modules/postcss-svgo

glob-parent  <5.1.2
Severity: moderate
Regular expression denial of service - https://npmjs.com/advisories/1751
fix available via `npm audit fix --force`
Will install react-scripts@1.1.5, which is a breaking change
node_modules/watchpack-chokidar2/node_modules/glob-parent
node_modules/webpack-dev-server/node_modules/glob-parent
  chokidar  1.0.0-rc1 - 2.1.8
  Depends on vulnerable versions of glob-parent
  node_modules/watchpack-chokidar2/node_modules/chokidar
  node_modules/webpack-dev-server/node_modules/chokidar
    watchpack-chokidar2  *
    Depends on vulnerable versions of chokidar
    node_modules/watchpack-chokidar2
      watchpack  1.7.2 - 1.7.5
      Depends on vulnerable versions of watchpack-chokidar2
      node_modules/watchpack
        webpack  4.44.0 - 4.46.0
        Depends on vulnerable versions of watchpack
        node_modules/webpack
    webpack-dev-server  2.0.0-beta - 3.11.2
    Depends on vulnerable versions of chokidar
    node_modules/webpack-dev-server
      @pmmmwh/react-refresh-webpack-plugin  0.3.1 - 0.5.0-beta.4
      Depends on vulnerable versions of webpack-dev-server
      node_modules/@pmmmwh/react-refresh-webpack-plugin
        react-scripts  >=0.10.0-alpha.328cb32e
        Depends on vulnerable versions of @pmmmwh/react-refresh-webpack-plugin
        Depends on vulnerable versions of @svgr/webpack
        Depends on vulnerable versions of css-loader
        Depends on vulnerable versions of mini-css-extract-plugin
        Depends on vulnerable versions of react-dev-utils
        Depends on vulnerable versions of resolve-url-loader
        Depends on vulnerable versions of webpack-dev-server
        node_modules/react-scripts
          @craco/craco  <=2.2.3 || >=6.0.0
          Depends on vulnerable versions of react-scripts
          node_modules/@craco/craco

mem  <4.0.0
Denial of Service - https://npmjs.com/advisories/1084
No fix available
node_modules/mem
  os-locale  2.0.0 - 3.0.0
  Depends on vulnerable versions of mem
  node_modules/os-locale
    yargs  4.0.0-alpha1 - 12.0.5 || 14.1.0 || 15.0.0 - 15.2.0
    Depends on vulnerable versions of os-locale
    Depends on vulnerable versions of yargs-parser
    node_modules/eslint-find-rules/node_modules/yargs
      eslint-find-rules  *
      Depends on vulnerable versions of yargs
      node_modules/eslint-find-rules

normalize-url  <=4.5.0 || 5.0.0 - 5.3.0 || 6.0.0
Severity: high
Regular Expression Denial of Service - https://npmjs.com/advisories/1755
fix available via `npm audit fix --force`
Will install react-scripts@1.1.5, which is a breaking change
node_modules/normalize-url
node_modules/postcss-normalize-url/node_modules/normalize-url
  mini-css-extract-plugin  0.6.0 - 1.0.0
  Depends on vulnerable versions of normalize-url
  node_modules/mini-css-extract-plugin
    react-scripts  >=0.10.0-alpha.328cb32e
    Depends on vulnerable versions of @pmmmwh/react-refresh-webpack-plugin
    Depends on vulnerable versions of @svgr/webpack
    Depends on vulnerable versions of css-loader
    Depends on vulnerable versions of mini-css-extract-plugin
    Depends on vulnerable versions of react-dev-utils
    Depends on vulnerable versions of resolve-url-loader
    Depends on vulnerable versions of webpack-dev-server
    node_modules/react-scripts
      @craco/craco  <=2.2.3 || >=6.0.0
      Depends on vulnerable versions of react-scripts
      node_modules/@craco/craco
  postcss-normalize-url  <=4.0.1
  Depends on vulnerable versions of normalize-url
  Depends on vulnerable versions of postcss
  node_modules/postcss-normalize-url
    cssnano-preset-default  <=4.0.8
    Depends on vulnerable versions of css-declaration-sorter
    Depends on vulnerable versions of cssnano-util-raw-cache
    Depends on vulnerable versions of postcss
    Depends on vulnerable versions of postcss-normalize-url
    node_modules/cssnano-preset-default

postcss  7.0.0 - 8.2.9
Severity: moderate
Regular Expression Denial of Service - https://npmjs.com/advisories/1693
fix available via `npm audit fix --force`
Will install react-scripts@1.1.5, which is a breaking change
node_modules/postcss
node_modules/resolve-url-loader/node_modules/postcss
  autoprefixer  9.0.0 - 9.8.6
  Depends on vulnerable versions of postcss
  node_modules/autoprefixer
  css-blank-pseudo  *
  Depends on vulnerable versions of postcss
  node_modules/css-blank-pseudo
  css-declaration-sorter  4.0.0 - 5.1.2
  Depends on vulnerable versions of postcss
  node_modules/css-declaration-sorter
    cssnano-preset-default  <=4.0.8
    Depends on vulnerable versions of css-declaration-sorter
    Depends on vulnerable versions of cssnano-util-raw-cache
    Depends on vulnerable versions of postcss
    Depends on vulnerable versions of postcss-normalize-url
    node_modules/cssnano-preset-default
  css-has-pseudo  *
  Depends on vulnerable versions of postcss
  node_modules/css-has-pseudo
    postcss-preset-env  >=6.0.0
    Depends on vulnerable versions of css-has-pseudo
    Depends on vulnerable versions of css-prefers-color-scheme
    Depends on vulnerable versions of postcss
    Depends on vulnerable versions of postcss-color-gray
    Depends on vulnerable versions of postcss-double-position-gradients
    node_modules/postcss-preset-env
  css-loader  2.0.0 - 4.3.0
  Depends on vulnerable versions of postcss
  node_modules/css-loader
    react-scripts  >=0.10.0-alpha.328cb32e
    Depends on vulnerable versions of @pmmmwh/react-refresh-webpack-plugin
    Depends on vulnerable versions of @svgr/webpack
    Depends on vulnerable versions of css-loader
    Depends on vulnerable versions of mini-css-extract-plugin
    Depends on vulnerable versions of react-dev-utils
    Depends on vulnerable versions of resolve-url-loader
    Depends on vulnerable versions of webpack-dev-server
    node_modules/react-scripts
      @craco/craco  <=2.2.3 || >=6.0.0
      Depends on vulnerable versions of react-scripts
      node_modules/@craco/craco
  css-prefers-color-scheme  *
  Depends on vulnerable versions of postcss
  node_modules/css-prefers-color-scheme
  cssnano  4.0.0-nightly.2020.1.9 - 4.0.0-rc.2 || 4.1.1 - 4.1.11
  Depends on vulnerable versions of postcss
  node_modules/cssnano
    optimize-css-assets-webpack-plugin  3.2.1 || 5.0.2 - 5.0.6
    Depends on vulnerable versions of cssnano
    node_modules/optimize-css-assets-webpack-plugin
  cssnano-util-raw-cache  >=4.0.1
  Depends on vulnerable versions of postcss
  node_modules/cssnano-util-raw-cache
  icss-utils  4.0.0 - 4.1.1
  Depends on vulnerable versions of postcss
  node_modules/icss-utils
    postcss-modules-local-by-default  2.0.0 - 4.0.0-rc.4
    Depends on vulnerable versions of icss-utils
    Depends on vulnerable versions of postcss
    node_modules/postcss-modules-local-by-default
    postcss-modules-values  2.0.0 - 4.0.0-rc.5
    Depends on vulnerable versions of icss-utils
    Depends on vulnerable versions of postcss
    node_modules/postcss-modules-values
  postcss-attribute-case-insensitive  4.0.0 - 4.0.2
  Depends on vulnerable versions of postcss
  node_modules/postcss-attribute-case-insensitive
  postcss-browser-comments  2.0.0 - 3.0.0
  Depends on vulnerable versions of postcss
  node_modules/postcss-browser-comments
    postcss-normalize  7.0.0 - 9.0.0
    Depends on vulnerable versions of postcss
    Depends on vulnerable versions of postcss-browser-comments
    node_modules/postcss-normalize
  postcss-calc  6.0.2 - 7.0.5
  Depends on vulnerable versions of postcss
  node_modules/postcss-calc
  postcss-color-functional-notation  >=2.0.0
  Depends on vulnerable versions of postcss
  node_modules/postcss-color-functional-notation
  postcss-color-gray  >=5.0.0
  Depends on vulnerable versions of postcss
  node_modules/postcss-color-gray
  postcss-color-hex-alpha  4.0.0 - 6.0.0
  Depends on vulnerable versions of postcss
  node_modules/postcss-color-hex-alpha
  postcss-color-mod-function  >=3.0.0
  Depends on vulnerable versions of postcss
  node_modules/postcss-color-mod-function
  postcss-color-rebeccapurple  >=4.0.0
  Depends on vulnerable versions of postcss
  node_modules/postcss-color-rebeccapurple
  postcss-colormin  4.0.0-nightly.2020.1.9 - 4.0.0-rc.2 || 4.0.2 - 4.0.3
  Depends on vulnerable versions of postcss
  node_modules/postcss-colormin
  postcss-convert-values  4.0.0-nightly.2020.1.9 - 4.0.0-rc.2 || 4.0.1
  Depends on vulnerable versions of postcss
  node_modules/postcss-convert-values
  postcss-custom-media  7.0.0 - 7.0.8
  Depends on vulnerable versions of postcss
  node_modules/postcss-custom-media
  postcss-custom-properties  8.0.0 - 10.0.0
  Depends on vulnerable versions of postcss
  node_modules/postcss-custom-properties
  postcss-custom-selectors  5.0.0 - 5.1.2
  Depends on vulnerable versions of postcss
  node_modules/postcss-custom-selectors
  postcss-dir-pseudo-class  >=5.0.0
  Depends on vulnerable versions of postcss
  node_modules/postcss-dir-pseudo-class
  postcss-discard-comments  4.0.0-nightly.2020.1.9 - 4.0.0-rc.2 || 4.0.1 - 4.0.2
  Depends on vulnerable versions of postcss
  node_modules/postcss-discard-comments
  postcss-discard-duplicates  4.0.0-nightly.2020.1.9 - 4.0.0-rc.2 || 4.0.2
  Depends on vulnerable versions of postcss
  node_modules/postcss-discard-duplicates
  postcss-discard-empty  4.0.0-nightly.2020.1.9 - 4.0.0-rc.2 || 4.0.1
  Depends on vulnerable versions of postcss
  node_modules/postcss-discard-empty
  postcss-discard-overridden  4.0.0-nightly.2020.1.9 - 4.0.0-rc.2 || 4.0.1
  Depends on vulnerable versions of postcss
  node_modules/postcss-discard-overridden
  postcss-double-position-gradients  *
  Depends on vulnerable versions of postcss
  node_modules/postcss-double-position-gradients
  postcss-env-function  >=2.0.0
  Depends on vulnerable versions of postcss
  node_modules/postcss-env-function
  postcss-flexbugs-fixes  4.0.0 - 4.2.1
  Depends on vulnerable versions of postcss
  node_modules/postcss-flexbugs-fixes
  postcss-focus-visible  >=4.0.0
  Depends on vulnerable versions of postcss
  node_modules/postcss-focus-visible
  postcss-focus-within  >=3.0.0
  Depends on vulnerable versions of postcss
  node_modules/postcss-focus-within
  postcss-font-variant  4.0.0 - 4.0.1
  Depends on vulnerable versions of postcss
  node_modules/postcss-font-variant
  postcss-gap-properties  >=2.0.0
  Depends on vulnerable versions of postcss
  node_modules/postcss-gap-properties
  postcss-image-set-function  >=3.0.0
  Depends on vulnerable versions of postcss
  node_modules/postcss-image-set-function
  postcss-initial  3.0.0 - 3.0.4
  Depends on vulnerable versions of postcss
  node_modules/postcss-initial
  postcss-lab-function  >=2.0.0
  Depends on vulnerable versions of postcss
  node_modules/postcss-lab-function
  postcss-loader  3.0.0 - 4.0.1
  Depends on vulnerable versions of postcss
  node_modules/postcss-loader
  postcss-logical  >=2.0.0
  Depends on vulnerable versions of postcss
  node_modules/postcss-logical
  postcss-media-minmax  4.0.0
  Depends on vulnerable versions of postcss
  node_modules/postcss-media-minmax
  postcss-merge-longhand  4.0.0-nightly.2020.1.9 - 4.0.0-rc.2 || 4.0.6 - 4.0.11
  Depends on vulnerable versions of postcss
  node_modules/postcss-merge-longhand
  postcss-merge-rules  4.0.0-nightly.2020.1.9 - 4.0.0-rc.2 || 4.0.2 - 4.0.3
  Depends on vulnerable versions of postcss
  node_modules/postcss-merge-rules
  postcss-minify-font-values  4.0.0-nightly.2020.1.9 - 4.0.0-rc.2 || 4.0.2
  Depends on vulnerable versions of postcss
  node_modules/postcss-minify-font-values
  postcss-minify-gradients  4.0.0-nightly.2020.1.9 - 4.0.0-rc.2 || 4.0.1 - 4.0.2
  Depends on vulnerable versions of postcss
  node_modules/postcss-minify-gradients
  postcss-minify-params  4.0.0-nightly.2020.1.9 - 4.0.0-rc.2 || 4.0.1 - 4.0.2
  Depends on vulnerable versions of postcss
  node_modules/postcss-minify-params
  postcss-minify-selectors  4.0.0-nightly.2020.1.9 - 4.0.0-rc.2 || 4.0.1 - 4.0.2
  Depends on vulnerable versions of postcss
  node_modules/postcss-minify-selectors
  postcss-modules-extract-imports  2.0.0
  Depends on vulnerable versions of postcss
  node_modules/postcss-modules-extract-imports
  postcss-modules-scope  2.0.0 - 2.2.0
  Depends on vulnerable versions of postcss
  node_modules/postcss-modules-scope
  postcss-nesting  7.0.0 - 7.0.1
  Depends on vulnerable versions of postcss
  node_modules/postcss-nesting
  postcss-normalize-charset  4.0.0-nightly.2020.1.9 - 4.0.0-rc.2 || 4.0.1
  Depends on vulnerable versions of postcss
  node_modules/postcss-normalize-charset
  postcss-normalize-display-values  <=4.0.0-rc.2 || 4.0.1 - 4.0.2
  Depends on vulnerable versions of postcss
  node_modules/postcss-normalize-display-values
  postcss-normalize-positions  <=4.0.0-rc.2 || 4.0.1 - 4.0.2
  Depends on vulnerable versions of postcss
  node_modules/postcss-normalize-positions
  postcss-normalize-repeat-style  <=4.0.0-rc.2 || 4.0.1 - 4.0.2
  Depends on vulnerable versions of postcss
  node_modules/postcss-normalize-repeat-style
  postcss-normalize-string  <=4.0.0-rc.2 || 4.0.1 - 4.0.2
  Depends on vulnerable versions of postcss
  node_modules/postcss-normalize-string
  postcss-normalize-timing-functions  <=4.0.0-rc.2 || 4.0.1 - 4.0.2
  Depends on vulnerable versions of postcss
  node_modules/postcss-normalize-timing-functions
  postcss-normalize-unicode  <=4.0.0-rc.2 || 4.0.1
  Depends on vulnerable versions of postcss
  node_modules/postcss-normalize-unicode
  postcss-normalize-url  <=4.0.1
  Depends on vulnerable versions of normalize-url
  Depends on vulnerable versions of postcss
  node_modules/postcss-normalize-url
  postcss-normalize-whitespace  <=4.0.0-rc.2 || 4.0.1 - 4.0.2
  Depends on vulnerable versions of postcss
  node_modules/postcss-normalize-whitespace
  postcss-ordered-values  4.0.0-nightly.2020.1.9 - 4.0.0-rc.2 || 4.1.1 - 4.1.2
  Depends on vulnerable versions of postcss
  node_modules/postcss-ordered-values
  postcss-overflow-shorthand  >=2.0.0
  Depends on vulnerable versions of postcss
  node_modules/postcss-overflow-shorthand
  postcss-page-break  2.0.0
  Depends on vulnerable versions of postcss
  node_modules/postcss-page-break
  postcss-place  >=4.0.0
  Depends on vulnerable versions of postcss
  node_modules/postcss-place
  postcss-pseudo-class-any-link  >=6.0.0
  Depends on vulnerable versions of postcss
  node_modules/postcss-pseudo-class-any-link
  postcss-reduce-initial  4.0.0-nightly.2020.1.9 - 4.0.0-rc.2 || 4.0.2 - 4.0.3
  Depends on vulnerable versions of postcss
  node_modules/postcss-reduce-initial
  postcss-reduce-transforms  4.0.0-nightly.2020.1.9 - 4.0.0-rc.2 || 4.0.1 - 4.0.2
  Depends on vulnerable versions of postcss
  node_modules/postcss-reduce-transforms
  postcss-replace-overflow-wrap  3.0.0
  Depends on vulnerable versions of postcss
  node_modules/postcss-replace-overflow-wrap
  postcss-selector-matches  >=4.0.0
  Depends on vulnerable versions of postcss
  node_modules/postcss-selector-matches
  postcss-selector-not  4.0.0 - 4.0.1
  Depends on vulnerable versions of postcss
  node_modules/postcss-selector-not
  postcss-svgo  >=4.0.0-nightly.2020.1.9
  Depends on vulnerable versions of postcss
  Depends on vulnerable versions of svgo
  node_modules/postcss-svgo
  postcss-unique-selectors  4.0.0-nightly.2020.1.9 - 4.0.0-rc.2 || 4.0.1
  Depends on vulnerable versions of postcss
  node_modules/postcss-unique-selectors
  resolve-url-loader  3.0.0-alpha.1 - 4.0.0
  Depends on vulnerable versions of postcss
  node_modules/resolve-url-loader
  stylehacks  4.0.0-nightly.2020.1.9 - 4.0.0-rc.2 || 4.0.1 - 4.0.3
  Depends on vulnerable versions of postcss
  node_modules/stylehacks

ws  5.0.0 - 6.2.1 || 7.0.0 - 7.4.5
Severity: moderate
Regular Expression Denial of Service - https://npmjs.com/advisories/1748
fix available via `npm audit fix`
node_modules/webpack-dev-server/node_modules/ws

yargs-parser  <=13.1.1 || 14.0.0 - 15.0.0 || 16.0.0 - 18.1.1
Prototype Pollution - https://npmjs.com/advisories/1500
No fix available
node_modules/eslint-find-rules/node_modules/yargs-parser
  yargs  4.0.0-alpha1 - 12.0.5 || 14.1.0 || 15.0.0 - 15.2.0
  Depends on vulnerable versions of os-locale
  Depends on vulnerable versions of yargs-parser
  node_modules/eslint-find-rules/node_modules/yargs
    eslint-find-rules  *
    Depends on vulnerable versions of yargs
    node_modules/eslint-find-rules

104 vulnerabilities (5 low, 87 moderate, 12 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues possible (including breaking changes), run:
  npm audit fix --force

Some issues need review, and may require choosing
a different dependency.
```

</details>

## Slightly less silly dependency note

__The typescript version is still 4.2.4__. See <https://github.com/facebook/create-react-app/issues/11022>

## Also

This uses `String.prototype.replaceAll`, so your node version must be `>=15.0.0`. In gitpod do `nvm install 16` on each new terminal.
