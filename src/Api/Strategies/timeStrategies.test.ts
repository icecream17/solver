
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
      totalspeed: number
      totaldeviation: number
      timetaken: number
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
            get totalspeed() {return this.processed / this.timetaken},
            totaldeviation: 0,
            timetaken: 0,
         }
         const start = Date.now()

         // Do strategy
         // @ts-expect-error - bruh
         const {successcount = 0} = Strategy(sudoku, { solved: 0 })

         // Update process / error
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
                  solved.add(i)
               } else {
                  const representation = sudoku.to729()
                  if (!already.has(representation)) {
                     already.add(representation)
                     todo.push({ repr: representation, i })
                  }
               }
            }
         }

         // Update speed
         const oldtotalspeed = results[Strategy.name].totalspeed
         const timetaken = Date.now() - start
         results[Strategy.name].timetaken += timetaken
         results[Strategy.name].totaldeviation += Math.abs(oldtotalspeed - results[Strategy.name].totalspeed)
         // const averagedeviation = results[Strategy.name].totaldeviation / results[Strategy.name].processed
         // if (averagedeviation / results[Strategy.name].processed < 0.0001 && timetaken > 100 && results[Strategy.name].processed > 100) {
         //    break
         // }

         if (done % 0x1000 === 0) {
            // unless there's a bug, done is at most 1465*12^729 = <790 digits>
            // In practice, it currently finishes at (done: 5081776)
            console.log({
               solved: solved.size,
               loops: done / 0x1000,
               done,
               total: todo.length * (STRATEGIES.length + 1),
               todo: todo.length * (STRATEGIES.length + 1) - done,
               progress: (100 * done / (todo.length * (STRATEGIES.length + 1))).toPrecision(7),
            })
         }
      }
   }

   console.log(done)
   console.log(results)

   window._custom = old
}

// This test takes about 1600 s, so only enable in special circumstances
// Enabling now since this is the first time, but the next commit will disable.
const shouldTime = Date.now() < 1650642500000
if (shouldTime) {
   main()
}

test('nothing', () => {
   expect(true).toBe(true)
});

