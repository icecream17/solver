# Strategies

## CheckForSolved

This succeeds if there are new solved digits ("big digits").

Also used to check if the sudoku is invalid, like having 0 fours in a column,
or 7 threes in a box.

## UpdateCandidates

For each solved digit, say "3", that digit cannot appear again in the same row, column, or box.

So any candidate "3"s there are eliminated

## Pairs, triples, and quads

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

## Hidden pairs, triples, and quads

Instead of N cells needing N candidates, N candidates must be in N cells.
So the rest of the candidates in those cells are eliminated.

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

## Ideas

### EstablishLink

This would establish a (nontrivial) link between two candidates.

Which could make the linking strategies more powerful.

Currently I have no linking strategies but when/if I do, this will be in mind.
