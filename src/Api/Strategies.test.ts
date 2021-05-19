import PureSudoku from "./PureSudoku"
import { checkValidity } from "./Strategies"

describe('checkValidity', () => {
   const testSudoku = new PureSudoku({ setup: true })

   test('a blank sudoku is valid (subject to change)', () => {
      expect(checkValidity(testSudoku).ok).toBe(true)
   })

   test('if a cell has no candidates left the sudoku is invalid', () => {
      testSudoku.data[0][0] = []
      expect(checkValidity(testSudoku).ok).toBe(false)
   })
})
