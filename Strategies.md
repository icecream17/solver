# Strategies

## Explanations

These strategies are probably better explained elsewhere.

I am not attempting to explain these strategies as much as document them.

### CheckForSolved

This succeeds if there are new solved digits ("big digits"). If the sudoku is completely filled in, it alerts "Finished!"

Also used to check if the sudoku is invalid, like having 0 fours in a column, or 7 threes in a box.

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

These strategies should basically be equivalent in any sane coding structure. Just swap cells and candidates. This algorithm description will be for non-hidden.

(Swapping cells and candidates:)

```rust
123...... 123...... 123......
123456789 123456789 123456789
123456789 123456789 123456789
```

Incidentally, it would seem that these two strategies are much harder than one would expect. A naive algorithm is exponential, as from k = \[1 to floor(n/2)], one checks every way to choose k out of n cells. There are at least $\frac{2^n - 1}{2}$ combinations (divide by two because symmetry).

However, some optimizations are possible. A cell that contains too many candidates (a candidate that is in too many cells) cannot be part of a valid solution. A candidate that is in too many cells (a cell that has too many candidates) must partake in at least one cell (candidate). In cases where the number of required candidates (cells) is too high, this is a linear NO SOLUTION.

```
 8 9 1, 9 1 2, 1 2 3, 2 3 4, 3 4 5, 4 5 6, 5 6 7, 6 7 8, 7 8 9,
```

We then check the case specifically for n=2 (thereby only polynomial, $\frac{n(n-1)}{2}$ ). Say we take the candidates 1 and 2. Cover all cells with 1 and 2. Add candidates to set (we add 9, 3, 4). Cover all cells with 1, 2, 9, 3, 4, etc. The process will quickly converge to the smallest conjugate containing just 1 and 2.

Then we check the cells containing 1 and 3.

And 1 and 4. The current algorithm simply checks all possible combinations. Note that while the case n=2 is polynomial, the
case n=2, n=3, ... n=floor(9/2) is exponential.

However, there is a faster way to figure out this particular example. Notice that 1 cannot go along with 3, 4, 5, 6, 7, 8.

```
 9 1, 9 1 2, 1 2, 2, 9,
```

Since 1 covers three cells, there needs to be 3 candidates. The only ones available are 2 and 9. But adding 2 and 9 fails.

### X wing, Swordfish, and Jellyfish

Consider the rule that each (row, column, and box)... each group must have all digits 1-9.

So how many 7s does one group have?

Each group has one 7.

So n non-intersecting groups have n of every candidate.

And notice how if 3 rows have 3 sevens, those 3 sevens must also appear in 3 columns!

So if you manage to limit n rows to n columns, the rest of those columns cannot have that candidate!

```rust
A..A..A..
e  e  e
e  e  e
A..A..A..
e  e  e
e  e  e
A..A..A..
e  e  e
e  e  e

// So for example, these 3 rows have 3 "A"
// ...which are all only 3 columns. So the 3 "A" in the 3 rows must be in the 3 columns
// Therefore, the 3 columns must only have "A" in the 3 rows

// 3 rows only in 3 columns -->
//    3 columns only in 3 rows
```

> Also each line is a "group" of all digits from 1 to 9
> So if you subtract 3 columns from 5 rows, whatever's leftover must have at least 2 groups
> When you're subtracting n-1 lines from n lines, the "extra" must have at least 1 of every digit.
> If all of that extra sees a candidate, that candidate can be removed.

Just see Hodoku's page on Basic Fish

Basically, 3 lines only appears in 3 crosslines = the rest of the crosslines can be eliminated

Now how do you detect this in code?

A naive way is to do this:

```rust
loop: for row in rows
  loop: for row2 in rows
    loop: for row3 in rows
      loop: for row4 in rows
        if onlyInFourColumns(row, row2, row3, row4):
          success!

// and same for the columns
```

But that's obviously inefficient. An improvement would be:

```rust
loop: for row in rows
  loop: for row2 in restOfRows
    loop: for row3 in restOfRestOfRows
      loop: for row4 in restOfRestOfRows
```

But notice that if `rows = [1, 2]`...

```rust
row: 1, row2: 2
row: 2, row2: 1
```

So instead, we eliminate the loops altogether,
and track what rows were added to the pattern.

That way, `row` ⇒ row1 then row2 then row3 then row4....
  (goes in order)
instead of `row` and `row2`
  (not in order)

```rust
total1 // [row]
total2 // [row, row2]
total3 // [row, row2, row3]
total4 // [row, row2, row3, row4]
for row in rows:
  update(row, total3, total4)
  update(row, total2, total3)
  update(row, total1, total2)
  check(total4)

fn update(row, total_n, total_n_plus_1):
  for group in total_n:
    add([row, ...group]).to(total_n_plus_1)

// Where the following is equivalent:
// total1 --> total1 + row
// [row, row2, row3] --> [[row + row], [row + row2], [row + row3]]
```

"Why not just do..."

```rust
loop: for row in rows
  loop: for row2 in greaterRows
    loop: for row3 in greaterGreaterRows
      loop: for row4 in greaterGreaterGreaterRows
```

Well... oh yeah. But whatever, I already wrote the function...

```rust
// 9 combinations * (time(3 * num_group * group.length) + check)
1
2
3
4
5
6
7
8
9

// 126 items (126 = 9 * 14) * check
1234
1235
1236
1237
1238
1239
```

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

### Two string kite (todo)

```rust
   A2    |   B2
A1       |
---------+------
B1       |   e

// A row and column share at box
// So either B1 or B2, so not e
```

### Y wing / XY wing / Bent triple

```rust
AB  BC
    n
    n
-------
n   AC
n
n

// Whatever BC is, either AB or AC will have A
// So A can be eliminated at n
```

### Two minus one lines

If you have 2 lines, and remove 1 crossline, the remainder must have at least 1 of \[unmentioned specific candidate].

So anything that sees *all* of the extras can be eliminated

```rust
// Example
  E E | C
e     |
e     |
------+--
E     | C

```

This happens to be equivalent to sashimi/finned x wing, but with 3 lines it's more general.

### XY Loop

See <https://youtu.be/OUKwjVs4MsY> for an explanation of an XY Loop.

It's basically an XY Chain, where both ends connect:

```rust
12 23
   34 45
--------
      56
61
```

You can color these candidates A or B, and any candidate seeing both A and B can be eliminated

```rust
12 23 a
b  34 45
--------
c  d  56
61 e  f

// 1 is eliminated from b and c
// 2 is eliminated from a and b
// 3 is eliminated from a, b, d, and e
// 4 is eliminated from a and b
// 5 is eliminated from a and f
// 6 is eliminated from c, d, e, and f
```

My implementation just so happens to not care if the last cell is connected to the first:

```rust
12 23    | (not 1)
   34 45 |
---------+---
      56 | 61
```

Which just so happens to implement XY Chain.

XY Chain (see <https://www.sudokuwiki.org/XY_Chains>) is a strategy which proves that some candidate, in this case 1, must appear on at least one end of the chain.

So wow!

Edit: See XY Chain

## XY Chain

About that XY Loop stuff... yeah, XY Chain is special enough to get it's own function now.

## Strategy speed

Here's a list of a bunch of strategies, ranked in order of how fast they currently are in my solver, and accompanied with some educated guesses on why they're slow/fast.

"Has dual" just notes that it can happen twice with an almost similar setup (e.g. same base or something)

I'm as surprised with the results as you are - this is definitely not how easy it is for humans

Ranking is ln random sudokus proccessed per ms.
So strategies that error or finish early get an advantage.

Some easy strategies find all instances within a sudoku = much slower

Tries: 2

- [x] Y wing / XY wing / Bent triple (11.71 - 11.77)
  - [] Has dual (multi coloring). There's also 3D medusa
  - [] This limited form is a subset of X chains
- [x] XY Loop (11.63 - 11.76)
- [x] Update candidates (11.62 - 11.76)
  - n^3 (n for each cell, n for each affects(cell), n for checking if affects(cell) contains that solved candidate)
- [x] XYZ Wing (11.64 - 11.73)
- [x] XY Chain (11.64 - 11.71)
- [x] Hidden singles (11.28 - 11.46)
  - n^3 (n for each candidate, n for each group, n for each cell in group (checking single))
  - Easier than update candidates because humans
  - Despite this, hidden singles doesn't work if the candidates are not updated
- [x] Check for solved (11.26 - 11.36)
  - n
  - But this also calls "checkValidity" which is about n^3
- [x] Skyscraper (Subset of wing/coloring) (10.81 - 10.92)
  - 2 lines - 1 line = extra
  - n^6 ({fish note} - but instead I spend n^3 * {n counting pend lines, n^3 to get attacks(cell of line), n^3 per attacks to get shared} = n^6)
- [x] X wing (really a fish) (10.64 - 10.84)
  - 2 lines have a candidate in only 2 crosslines
  - n^6 (see {fish note})
  - I have no idea why skyscraper would be faster
- [x] Swordfish (10.17 - 10.33)
  - 3 lines have a candidate in only 3 crosslines
  - n^6 (see {fish note})
- [x] Hidden pairs, triples, and quads (10.01 - 10.26)
  - N candidates are in N cells (which all see each other)
  - n^5 (Pretty much the same as the non hidden strategy.)
- [x] Pairs, triples, and quads (9.51 - 9.61)
  - N cells have N candidates (and all see each other)
  - n^5 (I have no idea how I did this. My code is quite big)
- [x] Intersection Removal (9.32 - 9.41)
  - All candidates in a box see OR All candidates in a line see
  - n^4 (n for each candidate, n^2 for box + line, n for each cell in (box - line) or (line - box))
- [x] Jellyfish (8.99 - 9.11)
  - 4 lines have a candidate in only 4 crosslines
  - n^6 (see {fish note})
- [x] Two minus one lines (8.14 - 8.15)

> {wing note}: Instead of nesting loops for each line in a wing, I do the following:
>
> X wing
>
> Check if line.size <= 2
> ...If so:
> ......Check each line in possibleInXwing to see if it completes the pattern!
> ......add it to possibleInXwing
>
> Swordfish
>
> Check if line.size <= 3
> ...If so:
> ......Check each line in twoLines to see if it completes the pattern!
> ......Check each line in possibleInXwing, and if it continues the pattern, add it to twoLines
> ......add it to possibleInXwing
>
> X wing
>
> Check if line.size <= 4
> ...If so:
> ......Check each line in threeLines to see if it completes the pattern!
> ......Check each line in twoLines, and if it continues the pattern, add it to threeLines
> ......Check each line in possibleInXwing, and if it continues the pattern, add it to twoLines
> ......Check each line in possibleInXwing to see if it completes the pattern!
> ......add it to possibleInXwing
>
>
>
> Since I accumulate lines instead of looping them, the detection is always n^2
>
> However, then I have to eliminate candidates, which adds a cost of
> (for each crossline) and (for each cell of line) and (for checking if that cell has that candidate)
>
> So in total, n^5 for each candidate, or n^6

## TODO

Unimplemented

- [x] 2-String Kite (Subset of coloring)
  - [x] Has dual
- [] Simple coloring
- [x] W wing
- [] Empty Rectangle
  - [] Has dual
- [] Empty Rectangle but as a Grouped Nice Loop
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
A     | E E E | B
  B   | E E E |   A
E E E | e e e | E E E
------+-------+------
  N   |       | A
N     |       |   B
      | - - - |

// "e" is eliminated since if all "E" was removed there would be an invalid loop
// Not sure how this could be detected

// Dashes are there by default if loop is by box

   | 999 |
89 | 789 | e
---+-----+---
n9 | 79  | 99999999999

// Say column 1 only has two possible 9s
// Column 2 can have any amount of 9s. Also the rows as well

// n9 is linked to 789 because of the 89 and 79
// e cannot be 9
```

### Combinations of almost fishes

```rust
// Idea when looking at https://youtu.be/OUKwjVs4MsY

56 6 | 58 | 8
   6 | 58 | 8 56

// Pretend all of these cells have way more digits
// However, in these two rows, 5, 6, and 8 are restricted...

// We can color the eights with A and B
56 6 | 5B | A
   6 | 5A | B 56

// Next we can color the fives with C and D, where A <> C and B <> D
C6 6 | DB | A
   6 | CA | B D6

// And finally the sixes
CE F | DB | A
   E | CA | B DF

// Tada! We have proved that in column 2, six must either be at F or E

// Of course, in the actual sudoku the same relation can be proved like this:
67 | 78
---+---
69 | 89

// If top left = 7, top right = 8, bottom right = 9, bottom left = 6
// In fact this is an XY Ring
// Kinda of like XY Chain but it's a Loop
```

### Substrat of Aligned Pair Exclusion

```rust
23   24   25  | 234567 e     e
              | 26     27

// This example is a UVWXYZ-Wing
```

## Exocet

See my comment ("Steven" on 7-AUG-2021) <https://www.sudokuwiki.org/Exocet>

Also this double exocet is impossible:

```rust
AB AB    |        |   AB AB
      T  |        | T
         | T      |

// However, if the double exocet base cells had "1234"
// and everything fits...

// ...except that 4 has 3 coverlines....
// That means, one of the base cells = 4 = invalid
// And the rest correspond to targets
```

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
