import boards from '../src/core/benchmark-boards'
import { createSession, importGrid, go } from '../src/core/session'

// Earlier deductions can prevent later strategies from running on a corpus.
// Dedicated candidate fixtures are still needed to exercise each strategy directly.
const limit = Number(process.argv[2] ?? 50)
if (!Number.isInteger(limit) || limit < 1)
   throw new Error('Pass a positive puzzle count: npm run bench -- 100')
let solved = 0,
   stalled = 0,
   errors = 0,
   turns = 0
const samples: number[] = []
const start = performance.now()
for (const representation of boards.slice(0, limit)) {
   let session = createSession(importGrid(representation)!.grid)
   const puzzleStart = performance.now()
   for (let turn = 0; turn < 729; turn++) {
      session = go(session)
      turns++
      if (session.outcome === 'solved') {
         solved++
         break
      }
      if (session.outcome === 'stalled') {
         stalled++
         break
      }
      if (session.outcome === 'error') {
         errors++
         break
      }
   }
   samples.push(performance.now() - puzzleStart)
}
samples.sort((a, b) => a - b)
console.table({
   puzzles: samples.length,
   solved,
   stalled,
   errors,
   turns,
   totalMs: Math.round(performance.now() - start),
   medianPuzzleMs: Number(samples[Math.floor(samples.length / 2)].toFixed(2)),
   p95PuzzleMs: Number(
      samples[Math.min(samples.length - 1, Math.floor(samples.length * 0.95))].toFixed(2)
   )
})
