# Public assets

Vite copies this directory into `dist/` without processing. The HTML entry point
is now the root `index.html`; edit its favicon reference when changing the icon.
The original `favicon.ico` is retained. Do not place secrets here.

`robots.txt` controls crawler requests, not authorization. Reference:
<https://www.robotstxt.org/robotstxt.html>. Preserve its useful reference comments.

The unused CRA logo and manifest files were removed. If an installable PWA is added,
start with the [web app manifest reference](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest)
and provide appropriate icons; do not advertise offline behavior without implementing
and testing it. See [Vite public assets](https://vite.dev/guide/assets.html#the-public-directory).
