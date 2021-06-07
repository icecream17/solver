import PureSudoku from "./PureSudoku"
import BOARDS from "./boards"

test('it constructs', () => {
   expect(() => new PureSudoku()).not.toThrow()
})

test('it imports', () => {
   const testSudoku = new PureSudoku()
   expect(testSudoku.import(BOARDS["Solved board"]).success).toBe(true)
   expect(testSudoku.data[0][0]).toStrictEqual([1])

   expect(testSudoku.import(BOARDS["Simple sudoku"]).success).toBe(true)
   expect(testSudoku.data[4][2]).toStrictEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])

   for (const board of Object.values(BOARDS)) {
      if (!testSudoku.import(board).success) {
         console.debug(board)
      }
      expect(testSudoku.import(board).success).toBe(true)
   }
})

test('setting a candidate', () => {
   const testSudoku = new PureSudoku()
   testSudoku.set(3, 1).to(4, 1, 5, 9, 2, 6)
   expect(testSudoku.data[3][1]).toStrictEqual([4, 1, 5, 9, 2, 6])
})

test('clear', () => {
   const testSudoku = new PureSudoku()
   testSudoku.set(3, 1).to(4, 1, 5, 9, 2, 6)
   testSudoku.clear()
   expect(testSudoku.data[3][1]).toStrictEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
   testSudoku.import(BOARDS["Solved board"])
   testSudoku.clear()
   expect(testSudoku.data[3][1]).toStrictEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
})
