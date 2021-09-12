import PureSudoku from "./PureSudoku"
import BOARDS from "../boards"

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
      expect(testSudoku._to81()).toBe(new PureSudoku(board)._to81())
   }
})

test('setting a candidate', () => {
   const testSudoku = new PureSudoku()
   testSudoku.set(3, 1).to(4, 1, 5, 9, 2, 6)
   expect(testSudoku.data[3][1]).toStrictEqual([4, 1, 5, 9, 2, 6])
})

test('set/clear', () => {
   const testSudoku = new PureSudoku()
   testSudoku.set(3, 1).to(4, 1, 5, 9, 2, 6)
   expect(testSudoku.data[3][1]).toStrictEqual([4, 1, 5, 9, 2, 6])
   testSudoku.clear()
   expect(testSudoku.data[3][1]).toStrictEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
   testSudoku.import(BOARDS["Solved board"])
   testSudoku.clear()
   expect(testSudoku.data[3][1]).toStrictEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
   testSudoku.set(3, 1).to(4, 1, 5, 9, 2, 6)
   testSudoku.clearCell(3, 1)
   expect(testSudoku.data[3][1]).toStrictEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
})

test('getColumn', () => {
   const testSudoku = new PureSudoku()
   testSudoku.set(7, 4).to(1, 2, 3)
   expect(testSudoku.getColumn(4)[7]).toStrictEqual([1, 2, 3])
   testSudoku.set(7, 0).to(1, 2, 3)
   expect(testSudoku.getColumn(0)[7]).toStrictEqual([1, 2, 3])
})

test('getBox', () => {
   const testSudoku = new PureSudoku()
   testSudoku.set(7, 4).to(1, 2, 3)
   expect(testSudoku.getBox(7)[4]).toStrictEqual([1, 2, 3])
   testSudoku.set(7, 0).to(1, 2, 3)
   expect(testSudoku.getBox(6)[3]).toStrictEqual([1, 2, 3])
   testSudoku.set(0, 8).to(1, 2, 3)
   expect(testSudoku.getBox(2)[2]).toStrictEqual([1, 2, 3])
})

test('_to81', () => {
   const testSudoku = new PureSudoku()
   testSudoku.set(1, 2).to(3)
   const toSudoku = new PureSudoku()
   expect(toSudoku.import(testSudoku._to81())).toStrictEqual({
      success: true,
      representationType: '81'
   })
   expect(toSudoku.data[1][2]).toStrictEqual([3]) // Only single candidate information is retained
})

test('to729', () => {
   const testSudoku = new PureSudoku()
   testSudoku.set(1, 2).to(3, 4, 5)
   const toSudoku = new PureSudoku()
   expect(toSudoku.import(testSudoku.to729())).toStrictEqual({
      success: true,
      representationType: '729'
   })
   expect(toSudoku.data[1][2]).toStrictEqual([3, 4, 5])
})
