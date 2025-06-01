
import { SuccessError } from '../Types';
import PureSudoku from '../Spaces/PureSudoku';
import STRATEGIES from './Strategies';
import mtBoards from '../mtBoards';

function main () {
   const old = window._custom
   window._custom = {
      alert() {},
      prompt() {}
   }

   function fastestStrategyEvar (_sudoku: PureSudoku, _options: { solved: 0 }) {
      return { success: false } as const
   }

   const results = {} as Record<string, {
      processed: number
      finds: number
      errors: number
      speeds: number[]
   }>

   let done = 0
   const already = new Set<string>()
   const todo = mtBoards.map((repr, i) => ({ repr, i }))
   const solved = new Set<number>()
   const strats = [fastestStrategyEvar, ...STRATEGIES]
   for (const { repr, i } of todo) {
      // Storing the representation instead of the sudoku to save memory
      // Can you believe it? A need to save memory in a dev environment
      // But this would've copied the sudoku anyways.
      // So it's probably more efficient timewise as well.
      const sudoku = new PureSudoku(repr)
      for (const Strategy of strats) {
         results[Strategy.name] ??= {
            processed: 0,
            finds: 0,
            errors: 0,
            speeds: [],
         }
         const start = Date.now()

         // Do strategy
         // @ts-expect-error - bruh
         const {successcount = 0} = Strategy(sudoku, { solved: 0 })
         const timetaken = Date.now() - start

         // Update speed
         results[Strategy.name].speeds.push(timetaken)

         // Update process / error
         let stratSuccess = false

         done++
         results[Strategy.name].processed++
         if (successcount === SuccessError) {
            // console.log(Strategy.name, "errored with", copy.to729())
            results[Strategy.name].errors++
         } else {
            results[Strategy.name].finds += successcount
            if (successcount > 0) {
               const isDone = sudoku.data.every(row => row.every(cell => cell.length === 1))
               if (isDone) {
                  // console.log('solved ' + i)
                  solved.add(i)
                  stratSuccess = true
               } else {
                  const representation = sudoku.to729()
                  if (!already.has(representation)) {
                     already.add(representation)
                     todo.push({ repr: representation, i })
                     stratSuccess = true
                  }
               }
            }
         }

         if (done % 0x1000 === 0) {
            // unless there's a bug, done is at most 1465*729 = 1067985
            // In practice, it currently finishes at (solved: 495, done: 122941)
            console.log({
               solved: solved.size,
               loops: done / 0x1000,
               done,
               total: todo.length * (STRATEGIES.length + 1),
               todo: todo.length * (STRATEGIES.length + 1) - done,
               progress: (100 * done / (todo.length * (STRATEGIES.length + 1))).toPrecision(7),
            })
         }

         // Earlier strats prevent later strats from being tried in most real scenarios
         if (stratSuccess) {
            break
         }
      }
   }

   console.log(`Solved ${solved.size} out of ${mtBoards.length} (~${100 * solved.size / mtBoards.length}%)`, done)

   for (const key in results) {
      // @ts-expect-error -- intentional
      results[key].ts = results[key].speeds.reduce((a, b) => a + b)
      // @ts-expect-error -- intentional
      results[key].stdev = results[key].speeds.map(a => (results[key].ts / results[key].processed - a) ** 2).reduce((a, b) => a + b) / results[key].processed
      // @ts-expect-error -- intentional
      results[key].accuracy = Math.log10(results[key].ts / results[key].stdev)
      // @ts-expect-error -- intentional
      results[key].hertz = results[key].processed / results[key].ts

      // @ts-expect-error
      delete results[key].ts
      // @ts-expect-error
      delete results[key].speeds
   }
   console.log(results)

   window._custom = old
}

// This test takes about 28s with many logs, so only enable in special circumstances
// Simply increase this number then change it back
const shouldTime = Date.now() < 1650642500000
if (shouldTime) {
   main()
}

test('nothing', () => {
   expect(true).toBe(true)
});

