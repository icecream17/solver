# Styleguide

1. Use the `Loading` class for lazy loaded placeholders.
2. If you need to update a component's state based on the previous state, use callbacks.
3. There's a top-down structure. Children should not know anything about their parents.
   - Methods will be so useful when I extract `Sudoku` somewhere else
