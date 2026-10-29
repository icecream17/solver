# Review confidence for PR #617

Assessed against rewrite `694130c`, with the serializer/comment changes and
additional verification in this pass. This is an evidence assessment, not an
independent approval or a probability that the PR contains no bugs.

## Assessment

There is enough evidence to treat the rewrite as a tested release candidate for
continued private use. Everyday editing, common solver workflows and the build
pipeline have meaningful coverage. Complete functional/design parity and soundness
of every deduction remain unproven. Replacing the old main app should follow a
focused review of the remaining high-risk boundaries and the exact final build.

| Area                                                    | Confidence from current evidence              | Limits                                                                                                                                   |
| ------------------------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Installation, compilation and production build          | Strong automated evidence                     | Node 22.22.2/24 on Linux, macOS and Windows; not every supported Node release or dependency/environment combination                      |
| Editing, keyboard, dialogs and common state transitions | Moderate to strong                            | Unit/component and production-browser tests plus owner's hands-on review; finite sequences leave interaction combinations untested       |
| Worker cancellation and stale-result ownership          | Moderate to strong                            | Stress fixture and race tests exercise the boundary; cold-worker latency remains a known usability issue                                 |
| Strategy results on the supplied corpus                 | Moderate, strengthened by reference solutions | All 1,465 puzzles have regression outcomes; the additional solution-preservation check verifies 1,461 within its reference-search budget |
| Every legal candidate elimination on arbitrary boards   | Incomplete                                    | A corpus and positive fixtures do not establish correctness for all candidate configurations or nonunique puzzles                        |
| Explanation quality                                     | Limited                                       | The implementation exposes marks/diffs, but role labels and generic messages often do not explain a deduction                            |
| Full legacy feature/style parity                        | Incomplete                                    | A file map, comment audit and repeated manual comparisons help; omitted behavior has already been discovered during review               |
| Actual-device, assistive-tech and print behavior        | Mixed                                         | Owner testing and engine checks help; mobile Chromium emulation is not iOS Safari, and computed print styles are not printer/PDF review  |
| Deployment and dependencies                             | Some automated evidence                       | Lockfile, pinned actions, restricted deployment condition and matrix checks help; this is not a full dependency/security audit           |

A full human read-through is neither the only source of confidence nor a proof by
itself. The more important gap here is correlated review: much of the implementation,
its tests and the follow-up analysis came from the same assistant. Shared assumptions
can survive both implementation and tests. Passing tests and high line coverage
show useful exercised behavior, but do not show that every requirement was asserted.
See Google's [coverage guidance](https://testing.googleblog.com/2020/08/code-coverage-best-practices.html).

The historical CI result at `694130c` passes 147 unit/component tests and 85 browser
checks, with three intentional desktop skips for touch-only cases. Its full corpus
outcomes are 496 solved, 969 stalled and zero errors. A stalled puzzle is not a
failure when only the enabled human strategies are available. These totals are
regression evidence, not an independent correctness oracle.

## Additional solution-preservation check

Reproduce it with:

```sh
node --import tsx scripts/check-solution-preservation.ts
```

An optional positive integer argument changes the reference search-node budget
per puzzle; the default is 200,000. The script parses the raw 81-character corpus
independently, checks the production parser against those givens, and finds one
solution using a separate bit-mask/backtracking implementation. That reference
search imports no production geometry, validity or strategy helpers. Each returned
solution is checked again against the givens and row/column/box uniqueness before
it is used as a reference.

After every Go command, it checks that the chosen solution is still present in
the current candidate sets. The recorded result is
[solution-preservation-results.json](solution-preservation-results.json):

- Reference solutions found for 1,461 of 1,465 puzzles.
- 24,288 solver commands checked; no chosen solution removed, no solver errors
  and no turn-limit exhaustion on that subset.
- Four puzzles exceeded the reference budget: **80, 299, 344 and 1041** (one-based
  corpus positions). They are explicitly unverified, not counted as passes.
- Changed-command counts show that every candidate-changing strategy executed,
  but unevenly: Jellyfish changed a grid only twice, versus 11,907 propagation
  commands. Check for solved correctly has no candidate-changing commands.

This check can falsify an implementation that removes a known valid solution.
It does not prove uniqueness, preserve every possible solution of a nonunique
puzzle, verify the strategy's stated logical rationale, or cover arbitrary manually
edited candidate boards. It is also written by the same assistant; an independent
algorithm is not an independent reviewer. The script reports skipped-budget
puzzles in JSON; budget exhaustion alone does not cause a nonzero exit status.

## Highest-value ways to increase confidence

| Priority | Work                                                                                              | Why it adds evidence                                                                                                                                                                     |
| -------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1        | Freeze a candidate SHA and review its actual built preview                                        | The preview last published in this conversation used `8db9c27`; that visual review does not cover the later CSS/cleanup changes. Every sign-off must identify its tested revision.       |
| 2        | Have another reviewer inspect the strategy-port differences and controller/worker boundaries      | Independent reasoning targets shared assumptions. Review bounded systems with their invariants, rather than requiring an undirected read of the entire PR.                               |
| 3        | Strengthen the oracle to test elimination soundness and the four budget cases                     | For each eliminated candidate, ask an independent solver whether the preceding board has a completion with that candidate forced. Include multiple-solution and candidate-grid fixtures. |
| 4        | Add targeted positive/negative and symmetry cases for rarely exercised strategies                 | Relabel digits, transpose/rotate, and permute rows/columns while preserving boxes. Check soundness and solution equivalence; exact deduction order may legitimately change.              |
| 5        | Test whether assertions detect deliberate mistakes                                                | Focused mutation testing can reveal cases where removing a guard or changing a candidate index still passes all tests. More coverage percentage alone would not answer this.             |
| 6        | Run structured adversarial sequences at the state boundary                                        | Edit/import/undo/toggle while solving, cancel/restart, revisit selections and repeat unchanged actions. Compare the expected committed grid, history and ownership after each sequence.  |
| 7        | Review on real iOS/Android and with VoiceOver/NVDA; inspect actual print/PDF output               | Engine emulation, ARIA attributes and computed colors leave device/announcement/pagination gaps.                                                                                         |
| 8        | Measure cold/warm command-to-paint time and resolve the remaining explanation/edit-diff decisions | These are known product-quality limitations. Record observable acceptance criteria instead of calling vague progress text a completed explanation.                                       |
| 9        | Check package/deployment changes with a dependency/CI reviewer                                    | Test success does not establish dependency safety, appropriate permissions or every deployment event path.                                                                               |
| 10       | Use a private trial and preserve a practical rollback                                             | Solve/export real puzzles using the frozen build; retain the old release and saved input examples so failures are reproducible and recovery is straightforward.                          |

The remaining old-comment design notes also deserve explicit decisions: normal
cell-by-cell Tab versus roving tabindex, future Shift-range selection, and a
comfortable switch hit area now that strategy names open learning links. These
are documented differences, not silently assumed parity.
