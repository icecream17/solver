# Solver command and state contract

This contract was established during the worker/state review after `4c61929`.
It states the required observable behavior for future changes. It is not a claim
that the rewrite was originally implemented from this document. The migration
notes, contributor guidance and historical confidence assessment have separate
purposes.

## Ownership and invariants

1. **Committed puzzle state changes atomically.** A worker computes on a snapshot.
   Progress never exposes an intermediate grid. Only the current command's result
   may replace the committed Session; a transport/computation failure leaves its
   grid and board history intact. An empty error message still produces visible
   failure feedback.
2. **At most one application command is active.** Solve while busy is ignored,
   not queued. Busy means there is a current operation owner; it is not an
   independently updated lifecycle flag.
3. **Invalidation precedes cancellation.** An edit to selected cells, Clear,
   successful import, Undo, a non-required strategy toggle, explicit Cancel or
   App teardown revokes the active command before cancelling its transport.
   Old progress, result, rejection and finally callbacks must then have no effect
   on Session, history, current status or a newer command's busy state.
4. **Navigation is independent of computation.** Focus/selection changes do not
   invalidate a solve. Completion must preserve the latest selection and its
   active/inactive state. A selected untouched all-nine cell still starts a new
   entry on the next digit. If a result narrows that cell, the next digit toggles
   within the new candidates. An explicitly entered all-nine set must retain its
   existing toggle intent when an unchanged result arrives.
5. **Board history records actual grid changes.** A successful command that changes
   candidates is one Undo action. Unchanged checks, failed strategies and transport
   failures add none. Results/cursor/status still advance after unchanged commands.
6. **Preferences outlive board Undo.** Undo restores the historical puzzle and
   explanation while retaining current enabled strategies. If the restored snapshot
   used different preferences, its cursor/skippable cache must be reset before
   scanning. If preferences match, restoring that cursor is permitted.
7. **Resources have one owner and one release.** The production runner pairs its
   worker and pending rejection in one active record. Success, computation error,
   load/decode/send error, invalid envelope and cancellation release that record,
   detach handlers and terminate its worker. A callback captured before release
   cannot release a later operation. Constructor failure owns no worker.
8. **View focus is not a completion effect.** The command does not refocus or blur
   cells or controls on completion. App teardown cancels and prevents late publishing.

These guarantees apply to Workspace commands and the bundled worker. Direct writes
to public fields are fixture/debug setup, not a supported alternate mutation path.

## Transition table

| Event                 | Active work                | Committed state/history                                       | Selection and entry intent                                                   |
| --------------------- | -------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Solve while idle      | Own a new command          | Keep committed Session until result                           | Preserve                                                                     |
| Solve while busy      | Keep current command       | No change                                                     | Preserve                                                                     |
| Current progress      | Keep current command       | Status only                                                   | Preserve                                                                     |
| Current result        | Release current command    | Apply Session; remember prior grid only if changed            | Preserve latest selection; remove stale first-entry flags for narrowed cells |
| Current failure       | Release current command    | Error status; grid/history unchanged                          | Preserve                                                                     |
| Cancel                | Revoke then terminate      | Cancellation status; grid/history unchanged                   | Preserve                                                                     |
| Edit with a selection | Revoke then terminate      | Apply selected-cell edit; history only if changed             | Preserve selection; update entry intent                                      |
| Clear / valid import  | Revoke then terminate      | Reset session; history only if grid changed                   | Deselect                                                                     |
| Invalid import        | Keep current command       | No change                                                     | Preserve                                                                     |
| Strategy toggle       | Revoke then terminate      | Keep grid; set preference and restart scan                    | Preserve                                                                     |
| Undo                  | Revoke then terminate      | Restore prior board, retain preferences, reconcile scan cache | Keep selection; recompute entry intent from restored grid                    |
| Selection/navigation  | Keep current command       | No grid/history change                                        | Apply immediately                                                            |
| Stale callback        | Keep newer command or idle | No change, including status/history                           | No change                                                                    |
| App teardown          | Revoke then terminate      | No late commit                                                | No focus restoration by the solver                                           |

## Transport policy and limits

The current implementation creates a worker per command and releases it at every
terminal event. This is a simple ownership policy with a real startup cost, not a
requirement for immediate cancellation: a reused worker could also be terminated.
Worker reuse should be evaluated against this contract and measured separately.

Each message has exactly one envelope field: `progress`, `error` or `session`.
Malformed/ambiguous envelopes and progress-callback exceptions reject the request
rather than leaving it pending. The Session payload is a typed value produced by
our bundled core; this is not a full schema validator for an arbitrary untrusted
worker or external service. Core deduction validity and rollback remain separate
responsibilities in `core/session.ts`.

There is no automatic search timeout. A long recursive search stays busy until it
returns or the user cancels. Responsiveness means the UI can still process that
cancellation; it does not imply that every search is fast.

## Acceptance evidence

Tests below are named by behavior so their assertions can be checked against the
contract. Counts and line coverage are not acceptance criteria.

| Required guarantee                                        | Focused evidence                                                                                                                                                        |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No stale publishing after a mutation                      | `workspace.test.ts`: each of edit/Clear/import/Undo/toggle crossed with late result and late error; checks Session, status and the next Undo target                     |
| Resolved transport cannot commit after local invalidation | `workspace.test.ts`: resolve the transport, edit before the await resumes, then verify the edited grid and Undo target                                                  |
| Old completion/finally cannot clear new busy state        | `workspace.test.ts`: cancel/start-new, then settle the old request while the new one remains active                                                                     |
| Selection during work survives                            | `workspace.test.ts`: untouched, narrowed, and explicitly entered all-nine cases; `e2e/solver.spec.ts`: delay actual worker loading, select a cell, finish, type a digit |
| Preferences and restored scan state agree                 | `workspace.test.ts` and browser test: skip disabled propagation, edit, re-enable, Undo, then expect propagation                                                         |
| No overlapping commands or cancellation on invalid import | `workspace.test.ts`: two Solve calls make one request; invalid import keeps it active                                                                                   |
| Terminal paths release resources exactly once             | `solver-runner.test.ts`: result, error, cancellation, constructor/send/decode failures, invalid envelopes and callback failure                                          |
| Old transport callbacks do not affect newer work          | `solver-runner.test.ts`: invoke callbacks captured before cancellation/completion, after a later request starts                                                         |
| Teardown revokes pending work                             | `App.test.ts`: unmount during work, deliver a late result, verify no commit/history entry                                                                               |
| Real expensive work stays cancellable                     | Existing browser test reaches XY Ring on the dense candidate fixture, cancels and starts another solve                                                                  |
| History and ordinary controls retain existing behavior    | Existing board-action, no-op history, bounded-history, keyboard and repeated-Space tests                                                                                |

The controlled runner intentionally allows late deliveries after Cancel, so it
can test Workspace's defense independently of the production transport. The fake
worker captures old handlers before detachment; simply calling a now-null handler
would make the stale-callback test vacuous. Browser tests exercise the real worker
and DOM; unit doubles do not establish browser scheduling/layout behavior.

## What remains outside this contract

This does not prove every mathematical strategy sound, make the explanations
useful, validate all possible data from hostile producers, measure cold-worker
latency, establish every device/assistive-technology interaction, or cover every
possible action sequence. Those remain distinct review/testing tasks. The two
new regressions found here are evidence that the previous suite missed important
transitions despite high coverage.

## Targeted test sensitivity check

During this review, six temporary changes deliberately violated the contract:
removing the stale-result guard, moving history recording before that guard,
clearing busy state unconditionally in finally, omitting Undo's preference-cache
reset, restoring completion's selection reset, and removing the runner's release
ownership check. Each caused the relevant focused tests to fail on observable
state, history, pending-work or resource assertions. The original source was
restored after each check. This is a bounded check of those assertions, not a
complete mutation score or a proof of all possible event orderings.
