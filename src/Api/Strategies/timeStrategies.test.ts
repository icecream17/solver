
import { ALL_CANDIDATES, INDICES_TO_NINE, SudokuDigits } from '../../Types';
import PureSudoku from '../Spaces/PureSudoku';
import STRATEGIES from './Strategies';

function main () {
   const old = window._custom
   window._custom = {
      alert() {},
      prompt() {}
   }

   const random = (() => {
      let current = 0
      let times = 0
      const random = function () {
         current += 0.538463141592653589793
         current *= times++
         return (current %= 1)
      }
      random.reset = () => {
         current = 0
         times = 0
      }
      return random
   })()

   let count = 0
   function makeSudoku () {
      const sudoku = new PureSudoku()
      for (const row of INDICES_TO_NINE) {
         for (const column of INDICES_TO_NINE) {
            const candidates = [] as SudokuDigits[]
            for (const candidate of ALL_CANDIDATES) {
               if (random() > random()) {
                  candidates.push(candidate)
               }
            }
            sudoku.set(row, column).to(...candidates)
         }
      }

      const old2 = sudoku.set.bind(sudoku)
      sudoku.set = (row, column) => {
         count++
         return old2(row, column)
      }
      return sudoku
   }

   function* sudokus () {
      while (true) {
         yield makeSudoku()
      }
   }

   function fastestStrategyEvar (_sudoku: PureSudoku, _options: { solved: 0 }) {
      return { success: false } as const
   }

   for (const Strategy of [fastestStrategyEvar, ...STRATEGIES]) {
      const start = Date.now()
      let solved = 0
      let finds = 0
      let totalspeed = 0
      let totaldeviation = 0
      random.reset()
      count = 0
      for (const sudoku of sudokus()) { // @ts-expect-error - bruh
         finds += Strategy(sudoku, { solved: 0 })?.successcount ?? 0
         solved++
         const oldtotalspeed = totalspeed
         const timetaken = Date.now() - start
         if (timetaken !== 0) {
            totalspeed += solved / timetaken
         }
         totaldeviation += Math.abs(oldtotalspeed - totalspeed)
         const averagedeviation = totaldeviation / solved
         if (averagedeviation / solved < 0.0001 && timetaken > 100 && solved > 100) {
            break
         }
      }
      const finish = Date.now()
      console.log([
         `${Strategy.name} did ${solved} sudokus in ${finish - start}ms`,
         `sudokus per ms: ${solved / (finish - start)}`,
         `finds per ms: ${finds / (finish - start)}`,
         `set calls: ${count}`,
         `finds: ${finds}`,
         `sudoku: if calls take 1ms: ${solved / (finish + count - start)}`,
         `finds: if calls take 1ms: ${finds / (finish + count - start)}`,
         `ln solved: ${Math.log(solved)}`
      ].join('\n'))
   }

   window._custom = old
}

const shouldTime = true
if (shouldTime) {
   main()
}

test('nothing', () => {
   expect(true).toBe(true)
});

