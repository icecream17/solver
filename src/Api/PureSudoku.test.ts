import PureSudoku from "./PureSudoku"
import BOARDS from "./boards"

test('it constructs', () => {
   expect(() => new PureSudoku()).not.toThrow()
})

test('it imports', () => {
   const testSudoku = new PureSudoku()
   testSudoku.import(BOARDS["Solved board"])
   expect(testSudoku.data[0][0]).toStrictEqual([1])
   
   testSudoku.import(BOARDS["Simple sudoku"])
   expect(testSudoku.data[4][2]).toStrictEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
})

test('setting a candidate', () => {
   const testSudoku = new PureSudoku()
   testSudoku.set(3, 1).to(4, 1, 5, 9, 2, 6)
   expect(testSudoku.data[3][1]).toStrictEqual([4, 1, 5, 9, 2, 6])
})
