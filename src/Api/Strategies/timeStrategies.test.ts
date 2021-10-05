
import { ALL_CANDIDATES, INDICES_TO_NINE, SudokuDigits } from '../../Types';
import PureSudoku from '../Spaces/PureSudoku';
import STRATEGIES from './Strategies';

const old = window._custom
window._custom = {
   alert() {},
   prompt() {}
}

const sudokus = [] as PureSudoku[]
for (let i = 0; i <= 1; i += 0.01) {
   const sudoku = new PureSudoku()
   for (const row of INDICES_TO_NINE) {
      for (const column of INDICES_TO_NINE) {
         const candidates = [] as SudokuDigits[]
         for (const candidate of ALL_CANDIDATES) {
            if (Math.random() > i) {
               candidates.push(candidate)
            }
         }
         sudoku.set(row, column).to(...candidates)
      }
   }

   sudokus.push(sudoku)
}

for (const Strategy of STRATEGIES) {
   console.time(Strategy.name)
   for (const sudoku of sudokus) {
      Strategy(sudoku, { solved: 0 })
   }
   console.timeEnd(Strategy.name)
}

window._custom = old

test('nothing', () => {
   expect(true).toBe(true)
});

