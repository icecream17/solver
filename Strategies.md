# Strategies

## Explanations

These strategies are probably better explained elsewhere.

I am not attempting to explain these strategies as much as document them.

### CheckForSolved

This succeeds if there are new solved digits ("big digits").

Also used to check if the sudoku is invalid, like having 0 fours in a column,
or 7 threes in a box.

### UpdateCandidates

For each solved digit, say "3", that digit cannot appear again in the same row, column, or box.

So any candidate "3"s there are eliminated

### Pairs, triples, and quads

> N candidates appear in N cells which are in the same row/column/box, so in the rest of that row/column/box, those N candidates are eliminated

It's impossible for N cells to only have N-1 candidates.

Therefore, any candidate that causes the N cells to have N-1 candidates can be removed.

This is actually more general than the implementation, since the implementation checks for candidates that see *all N cells*.\
That isn't necessarily the case, like in this example:

```rust
1234 1234 .... | 48
123  123  .... |
.... .... .... |
---------------+

// (4 can be removed from A4 [row 1 column 4])
```

The reason why it's called "Pairs, triples, and quads" is because this strategy specifically searches for N cells having N candidates, e.g. 2 cells requiring 2 candidates, or 3 cells requiring 3 candidates, etc.\
So pairs, triples, and quads.

```rust
12 12 // Pair, eliminates "1" and "2" from any cells seeing the whole pair.
12 23 31 // Triple, eliminates "1", "2", and "3"
12 23 34 41 // Quad, of 1234
```

But theoretically, a strategy could include conjugates where N cells require N+1 or even N+2 candidates.

```rust
12345 12345 ..... | 45... 456..
..... 123.. 123.. |
..... ..... ..... |
------------------+

// Here, A5 must be 6
// Why? Well, if A5 was anything else, there would be a 45 pair with A4/A5
// This would eliminate both 4 and 5 from the conjugate of 4 cells in box 1
// And now those 4 cells (with 5 candidates) only have 3 candidates


// Actually here's an N+2 example

123456 123456 ...... | 456... 456... 4567..
...... 123... 123... |
...... ...... ...... |
---------------------+

// Same logic, if A6 is not 7, the resulting 456 triple would cause
// 4 cells to only have 123.
```

EDIT: This strategy is called Sue-De-Coq

Thanks to PixelPlucker from discord:

```md
r1c1 and r1c2 can contain at most one digit from the 123 triple and at most one digit from the 456 triple, completing them both. So {123} can be removed from the rest of the box, and {456} from the rest of the row
```

```md
No need to credit, I’m definitely not the first person to describe SDCs this way :laughing:
```

### Hidden pairs, triples, and quads

Instead of N cells needing N candidates, N candidates must be in N cells.
So the rest of the candidates in those *cells* are eliminated.

```rust
123456789 ...456789 ...456789
123456789 ...456789 ...456789
123456789 ...456789 ...456789
```

1, 2, and 3 have to be in the 3 leftmost cells... so

```rust
123...... ...456789 ...456789
123...... ...456789 ...456789
123...... ...456789 ...456789
```

### X wing, Swordfish, and Jellyfish

> n lines must have n of a candidate
> and those n candidates must all be in different... crosslines (which are perpendicular to the original lines)
>
> For example, 3 rows must have at least 3... sevens
> those 3 sevens must also be in different columns
> so those 3 sevens must be in 3 columns
>
> Usually you don't know what those columns are,
> but if you do \[know what those columns are],
> then you can be certain that each of the 3 rows has a seven corresponding to the 3 columns
>
> So, the rest of the 3 columns which are not part of the 3 rows _do not contain a seven_
>
> In short
> 3 lines correspond to 3 crosslines, crosslines - lines = not candidate
>
> Also
> n lines - n-1 lines = 1 line
> If all of that 1 line sees a candidate, that candidate can be removed.

Just see Hodoku's page on Basic Fish

Basically, 3 lines only appears in 3 crosslines = the rest of the crosslines can be eliminated

### Skyscraper

This is just an x-wing disjointed on one line.

Or you could say that 2 lines - 1 crossline means the extra has at least 1

```rust
. e e | A . .
A . . | . e e
. . . | . . .
------+-------
A . . | A . .
```

The reason this is so easy is because

1. Simpler than a finned/sashimi x wing. (No groups!)
2. It's super similar to an x wing.\
   In fact, one of the lines stay the same.

It's just below "x wing" is the strategy list below.

## TODO

Here's a list of a bunch of strategies, with somewhat of a difficulty spectrum

"Has dual" just notes that it can happen twice with an almost similar setup (e.g. same base or something)

A lot of this strategy ranking is me guessing.

- [x] Check for solved
- [x] Update candidates
- [x] Pairs, triples, and quads
- [x] Hidden pairs, triples, and quads
- [x] Intersection Removal
- [x] X wing (really a fish)
- [] Skyscraper (Subset of wing/coloring)
- [] 2-String Kite (Subset of coloring)
  - [] Has dual
- [x] Swordfish
- [x] Jellyfish
- [] Simple coloring
- [] Y wing / XY wing / Bent triple
  - [] Has dual (multi coloring). There's also 3D medusa
  - [] This limited form is a subset of X chains
- [] W wing
- [] Empty Rectangle
  - [] Has dual
- [] Empty Rectangle but as a Grouped Nice Loop
- [] XYZ wing
- [] WXYZ wing (basic)
- [] WXYZ wing (extended)

To add:

- More wings (Finned/Sashimi/Mutant)
- Wow (see below)
- Unique rectangles
- Bug
- Exocet
- Chains/Loops
  - X chains seem the easiest. They alternate strong/link, with both ends strong.
  - XY chains are X chains but with multiple candidate
- ALSs
  - Sue de coq uses ALSs but seems much easier.
  - Same with Almost Locked Triple, see below
  - Chains < Loops < ALS

## Ideas

### Finned/Sashimi Fish

> EDIT: The Hodoku page for "Finned/Sashimi Fish" is actually just as general as the strategy described here. (The SudokuWiki page isn't.)
>
> And it turns out, you can use boxes as well as rows
> So this is extension 2:
>
> 1. Take *n* rows, columns, or boxes; then subtract *n-1* row, columns, and boxes.
> 2. Whatever sees *all* of the remainder can be eliminated
>
> See the hodoku page for finned/sashimi fish, and complex fish

Say there's *n* rows in this fish. And you take away the candidates in *n-1* columns.

At most, *n-1* candidates from those *n* rows are in those *n-1* columns.

So, at least *1* of the remaining candidates in those *n* rows must be true!

Therefore, any candidate seeing all of those remaining candidates must be false!

```rust
C     | C     | A A A
      |       | e e e
C     | C     | A A A
------+-------+------
C     | C     |

// Here's an example with the 1st, 3rd, and 4th rows
// There are 3 rows, but at *most* there's 2 occurances in the *c* region
// Therefore, the A region must have at least 1 occurance.
// So such candidate could be eliminated from the *e* region

C     | C     | A
      |       |     e
C     | C     | 1 2
------+-------+------
C     | C     |     A
      |       | e
      |       | e

// Here's another example, where the extra cells than an different boxes
// I labeled such extra cells "attackers" represented with a capital A
// If there was an attacker at "1", nothing would change!
// But at "2", only the single elimination in box 3 applies.

C     | C     | A A A
e     | e     | e e e
C     | C     | A A A
------+-------+------
C     | C     |
e     | e     |
e     | e     |
------+-------+------
e     | e     |
e     | e     |
e     | e     |

// Notice that in the first example, there can be *at most* 1 occurance in the *a* region
// Therefore the *c* region must have 2 occurances!
// So actually there's more eliminations!

// Note:
// In the second example it's possible for the *c* region to only have 1 occurance.
// So it's not possible there

// Try finding it! Easy example:
// 012037000000000800000000000067051040000000000000000000045012009000000000000000000
```

### Wow

```rust
A     |   E   | B
  B   |   E   |   A
E E E |   e   | E E E
------+-------+------
  N   |   E   | A
N     |   E   |   B
      |       |

// "e" is eliminated since if all "E" was removed there would be an invalid loop
// Not sure how this could be detected
```

### Substrat of Aligned Pair Exclusion

```rust
23   24   25  | 234567 e     e
              | 26     27

// This example is a UVWXYZ-Wing
```

## Exocet

See my comment ("Steven" on 7-AUG-2021) <https://www.sudokuwiki.org/Exocet>

### Terrible

You know about Pattern Overlay?

It's exhausting to try all the combinations for 1 number! Ugh!

But... by trying the combinations... of the combinations for each digit,
the puzzle is guaranteed to be solved.

I wonder if this strategy can be simplified

### EstablishLink

This would establish a (nontrivial) link between two candidates.

Which could make the linking strategies more powerful.

Currently I have no linking strategies but when/if I do, this will be in mind.

### "I would call that an Almost Locked Triple"

There's also an "Almost Locked Pair".
The first actual results are here: <http://forum.enjoysudoku.com/help-almost-locked-candidates-move-t37339.html>

And also "Dual almost locked pair/triple"!???

<https://f-puzzles.com/?id=ydudzk22>
<https://f-puzzles.com/?id=yjgcfmdy>
