# Logic Puzzles

Features of logic puzzles.

## Features

There are cells, edges, and intersections.

### Cell shapes

Mostly squares. Hexagons exist too, but behind the scenes those are squares.

An interesting case is [squares split up into triangles](https://puzz.link/rules.html?ququ) -
we can probably shim those triangles as cells.

Another interesting case is [cells forming tiles](https://puzz.link/rules.html?nurimaze) -
it would be more accurate to call tiles the interactable things, and that's what the UI will show,
but under the hood, it's each cell, and the tiles are regions.

When it's something like [tile shading](https://puzz.link/rules.html?parquet),
the borders between cells in the tile may be removed.

### Contents

The contents of cells are often numbers but can also be:

- arbitrary symbol
- diagonal
- shapes
- shapes with symbols in them (usually circles)

Edges and intersections may have:

- lined symbols like "=" or "×"
- shapes
- shapes with symbols in them (usually circles)

Cells can be shaded or unshaded. Edges can exist as a thick border,
regular thin border, or have no border.

Also [this one puzzle uses arrows](https://puzz.link/rules.html?tetrochain).

Text/symbols may be in different colors, usually for contrast.

Though sudoku has candidate background colors as well as colors.

Incidentally, dots are just small circles.

### Lines

Cells are generally arranged in rows and columns, although spirals may
just be one row, and hexagons have rows, diagonals, and antidiagonals.

These will all be called lines.

Different lines either don't intersect, or intersect at one cell.

Lines may be toruses.

### Non-playable area

Some puzzles have clues that are **outside** the grid, though of course it's
convenient to programmatically extend the grid. These cells are called
**outside clues**. Likewise we have **inside clues**, for example in sudoku the
_inside clues_ are the givens.

### Shading cells

The possible shades are different for each puzzle. "Shaded" and "unshaded" merely
refer to two different possible shades, programmatically. (Note: perhaps dark
mode inverts things?)

- white
- gray (different possible shades)
- black
- red
- green
- color

If there are regions, then
[the shaded cells may need borders that are not shaded](https://puzz.link/rules.html?aqre)

Shaded cells have different text color for contrast

### Across cells and edges.

Paths may go across cells and edges. They generally start and end at a cell.
Or start and end at an intersection.

Two kinds of paths I've seen:

- thermometers
- lines

Lines may have different thickness and color.

For thermometers we also have bulb size.

## Data

Collection of features of different puzzles.

### puzzle-<>.com

binairo:

- Rectangular grid
- Shaded and unshaded circles in cells
- "=" and "×" symbols between cells
- users can interact with cells

yin-yang:

- Rectangular "go" grid
- White and black stones at intersections
- users can interact with intersections

thermometers:

- thermometers across cells
- thermometers can be filled (!)
- numbers outside grid
- outside border is bigger than inside border for grid

norinori:

- Shaded cells (gray)
- Smaller regions with bigger borders in the grid
- red "×" in cells (right click)

mosaic:

- Default is gray, unshaded = white (right click), shaded = black
- Numbers in cells
- Shading changes text color of number in cell

minesweeper:

- Colored numbers in cells
- Flags in cells
- Cell itself has outset border

gokigen naname (slant):

- Circled numbers in intersections
- Diagonal lines in cells
  - Diagonal lines do not overlap circled numbers

lits:

- color-shaded cells (not actually there, but it would be nice)

galaxies:

- unfilled circles in cells, between cells

tents:

- trees and tents in cells

battleships:

- dots in cells
- filled in circles and squares in cells, also possibly the squares have
  one side that is rounded

pipes:

- rotatable thermometers, smaller bulb
- red circle in a cell on top of blue shaded pipes
- wrap: 4 dots right next to the border

shingoki:

- Shaded and unshaded circles with numbers in cells
- large dot intersections, fill in the edges

stitches:

- colored borders

futoshiki:

- large edge space, symbol in space

shakashaka:

- diagonal shading

kakuro:

- incomplete diagonal with small numbers on either side

killer:

- dotted "cage" across cells, with number at top left

shikaku:

- dotted small border

### puzzles.wiki Presentation series

- unnumbered clues
- [circular grid](https://puzzles.mit.edu/2020/puzzle/ferris_of_them_all/)
- bridges (flow free)
- hexagonal grid
- overfilled spaces (multiple characters per cell)
- [spiral grid](https://puzzles.mit.edu/2002/green/D/Puzzle.html)

### https://puzz.link/list.html

- circled numbers in outside-grid cells
- squared numbers
- shaded circles with numbers
- hexagonal cells but the grid forms hexagon plus extra cells
- [3x overfilled spaces](https://puzz.link/rules.html?tapa)
- [colored shapes with numbers](https://puzz.link/rules.html?interbd)
- red highlights on errors:
  - cells (shaded (with numbers), outside of grid)
  - circled numbers
  - numbers

Progress compiling: next: Heyawake
