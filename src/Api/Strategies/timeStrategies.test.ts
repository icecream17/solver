
import { ALL_CANDIDATES, INDICES_TO_NINE, SudokuDigits } from '../../Types';
import PureSudoku from '../Spaces/PureSudoku';
import STRATEGIES from './Strategies';

const old = window._custom
window._custom = {
   alert() {},
   prompt() {}
}

const random = (() => {
   let current = 0
   let times = 0
   return () => {
      current += 0.538463141592653589793
      current *= times++
      return (current %= 1)
   }
})()

const _sudokus = [] as PureSudoku[]
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

   _sudokus.push(sudoku)
}

function* sudokus () {
   for (let i = 0; i < 1_000_000; i++) {
      if (i === _sudokus.length) {
         makeSudoku()
      }
      yield _sudokus[i]
   }
}

for (const Strategy of STRATEGIES) {
   const start = Date.now()
   let count = 0
   for (const sudoku of sudokus()) {
      Strategy(sudoku, { solved: 0 })

      count++
      if (Date.now() - start > 10_000) {
         break
      }
   }
   const finish = Date.now()
   console.log(`${Strategy.name} did ${count} sudokus in ${finish - start}ms\nspeed: ${count / (finish - start)}`)
}

window._custom = old

test('nothing', () => {
   expect(true).toBe(true)
});

