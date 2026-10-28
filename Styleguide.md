# Styleguide

- Keep a top-down structure: children receive data and callbacks. The solver must
  never know about UI components or the DOM.
- Own candidate data once. Derive display state rather than synchronizing copies.
- Keep domain operations in ordinary TypeScript; use Svelte 5 runes at the UI boundary.
- Preserve the dark palette, cyan links, monospace grid, and explanation color meanings.
- Use the `Loading` class if adding a lazy-loaded placeholder.
- Use native controls and retain keyboard, right-to-left, responsive, and print support.
