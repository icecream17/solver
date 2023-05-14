# Sudoku

Developer considerations about features.

There are so many features aaaa

## Priority

Lower number = Higher priority

Denoted as {`P0`}, {`P1`}, etc.

## Representation

Logically the most representative aria-role for the sudoku
would be a grid: <https://www.w3.org/WAI/ARIA/apg/patterns/grid/>

A grid is like a [table](https://www.w3.org/WAI/ARIA/apg/patterns/table/)
except that it has selectable, interactive elements.

This grid in particular supports selecting and editing multiple cells.

## Keyboard shortcuts

This part is based on <https://www.w3.org/WAI/ARIA/apg/patterns/grid/>
and <https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/>

> Copyright © 2022 W3C ® ([MIT](https://www.csail.mit.edu/),
> [ERCIM](https://www.ercim.eu/), [Keio](https://www.keio.ac.jp/),
> [Beihang](https://ev.buaa.edu.cn/))

I often use "the selection" instead of "focus". This is because only 1
element can be focused, but selection (some arbitrary code thing) applies to
multiple cells at once.

So before even describing navigation and editing...

### Focus

- <kbd>Escape</kbd> Unfocuses the focused cell {`P1`}

Everything should be navigable by keyboard.

> A primary keyboard navigation convention common across all platforms is that the <kbd>tab</kbd> and <kbd>shift</kbd>+<kbd>tab</kbd> keys move focus from one UI component to another while other keys, primarily the arrow keys, move focus inside of components that include multiple focusable elements. The path that the focus follows when pressing the tab key is known as the tab sequence or tab ring.
>
> Common examples of UI components that contain multiple focusable elements are radio groups, tablists, menus, and grids. A radio group, for example, contains multiple radio buttons, each of which is focusable. However, only one of the radio buttons is included in the tab sequence. After pressing the Tab key moves focus to a radio button in the group, pressing arrow keys moves focus among the radio buttons in the group, and pressing the Tab key moves focus out of the radio group to the next element in the tab sequence.

As such, when the sudoku is not focused, only the first or active cell will be focusable.
This will be done using the `tabindex` html property. {`P3`}

### Navigation + Selection

- <kbd>Right Arrow</kbd> Moves the selection 1 cell right {`P1`}
- <kbd>Left Arrow</kbd> Moves the selection 1 cell left {`P1`}
- <kbd>Down Arrow</kbd> Moves the selection 1 cell down {`P1`}
- <kbd>Up Arrow</kbd> Moves the selection 1 cell up {`P1`}

Note that these commands go to the other side when reaching the end {`P2`},
as if the sudoku were a torus rather than a square. e.g.: at the end of a row,
pressing <kbd>Right Arrow</kbd> will go to the start of the row.

**The aria link above says to _stop_ at the end, but ugh.**

Going to the end seems somewhat useful though, so I'll have these commands {`P3`}:

- <kbd>Ctrl</kbd>+<kbd>Right Arrow</kbd> Moves the selection to the end of the row
- <kbd>Ctrl</kbd>+<kbd>Left Arrow</kbd> Moves the selection to the start of the row
- <kbd>Ctrl</kbd>+<kbd>Down Arrow</kbd> Moves the selection to the end of the column
- <kbd>Ctrl</kbd>+<kbd>Up Arrow</kbd> Moves the selection to the start of the column

And just because the link above mentions it {`P3`}:

- <kbd>Home</kbd> = <kbd>Ctrl</kbd>+<kbd>Left Arrow</kbd>
- <kbd>End</kbd> = <kbd>Ctrl</kbd>+<kbd>Right Arrow</kbd>

Some extended variants of the above are {`P3`}:

- <kbd>Ctrl</kbd>+<kbd>Home</kbd> Moves the selection to the first cell in the first row
- <kbd>Ctrl</kbd>+<kbd>End</kbd> Moves the selection to the last cell in the last row
- <kbd>Page Down</kbd> Moves the selection 3 rows down
- <kbd>Page Up</kbd> Moves the selection 3 rows up

For <kbd>Page Up</kbd> and <kbd>Page Down</kbd> commands we actually **_do stop_ at the end**

(The aria guide says "an author-determined amount of rows" and I chose 3)
(The last two were optional but what the heck let's implement them anyway)

```txt
012344321 1
011223221 1 2
012122221 1 3
012212321 1 4
```

Also mentioned by the aria-grid link is scrolling to the selection
with <kbd>Page Down</kbd> and <kbd>Page Up</kbd>. {`P4`}

Finally, the commands that increase the selection size {`P2`}:

- <kbd>Ctrl</kbd>+<kbd>A</kbd> Selects all cells
- <kbd>Ctrl</kbd>+<kbd>Space</kbd> Selects the column
- <kbd>Shift</kbd>+<kbd>Space</kbd> Selects the row
- <kbd>Shift</kbd>+<kbd>Right Arrow</kbd> Extends selection one cell to the right
- <kbd>Shift</kbd>+<kbd>Left Arrow</kbd> Extends selection one cell to the left
- <kbd>Shift</kbd>+<kbd>Down Arrow</kbd> Extends selection one cell to the down<!-- lol -->
- <kbd>Shift</kbd>+<kbd>Up Arrow</kbd> Extends selection one cell to the up

### Editing

- <kbd>1-9</kbd> Toggles that candidate in a cell
    - if the first edit of a filled cell, then sets the cell to that digit
- <kbd>Backspace</kbd> or <kbd>Clear</kbd> or <kbd>Delete</kbd> Clears all candidates of the cell
- <kbd>Shift</kbd>+(above) Adds all candidates back to the cell

### Mobile users

On mobile, users can't use keyboard commands. So there will have to be something like an _on screen keyboard_.

The core commands needed are:

1. Candidate changing
2. Setting a cell to a single candidate
3. Resetting the contents of a cell (could be anything)
4. Clearing the contents of a cell (can't be anything)

Another useful tool is to **lock digits**: instead of (selecting a cell and clicking the number), one can (select a number then click all the cells).

### Holding multiple keys at the same time

User action | What the code sees
------------|-------------------
press key   | `keydown` with `repeat: false`
hold key    | `keydown` with `repeat: true` every few ms
release key | `keyup`

Importantly, in those `repeat: true` events, only one key out of all the keys pressed can be placed in the `key` attribute, so the browser just picks one.

This causes a bug where the user holds two keys at once, say <kbd>Up Arrow</kbd> and <kbd>Left Arrow</kbd>. The browser sends two "press key" events so there's an initial "up" and "left" action. But then, the browser sends "hold key" events with only <kbd>Up Arrow</kbd> in the `key` attribute. So the code will just do "up" actions, and never do an "up+left".

One way to fix this bug is to keep track of what keys are held and what keys are released. However, this causes another bug.

An element can only receive `key` events when it is focused. So when a user holds <kbd>Up Arrow</kbd>, and clicks outside the sudoku, the sudoku does not have focus. The user can release the <kbd>Up Arrow</kbd> and the code would never know. Then when the user focuses the sudoku and presses <kbd>Left Arrow</kbd>, the code will still think <kbd>Up Arrow</kbd> is being held, resulting in an "up+left" action when the user only did "up".

A solution is to keep track of being focused as well. But there are ways to release keys while still having the element focused, such as right-clicking or clicking outside the document.

#### Solution

Remember the _on screen keyboard_ for mobile? Well, let's have "up, down, left, right" commands.

When the code thinks that <kbd>Example</kbd> is being held even though it's not, the user can see this in the on-screen-keyboard.

Then the user can either click the button or press+release the key again.

#### Strategy

1. Implement multi-selection to separate focus and selection.
2. Implement mobile on-screen-keyboard.
3. Keep track of keys to allow diagonal movements.

### Ending

Here are a few more ideas:

+ <kbd>Control</kbd>+<kbd>D</kbd> which in the Atom Editor is like a "Select All that match". This is done in Cracking the Cryptic's sudoku by double-clicking.
+ Selecting the _candidates_ of a cell.
