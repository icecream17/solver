import { IndexToNine } from "../../Types";
import PureSudoku from "../PureSudoku";
import checkValidity from "./checkValidity";

let testSudoku: PureSudoku;

beforeEach(() => {
   testSudoku = new PureSudoku({ setup: true })
})

test('a blank sudoku is valid (subject to change)', () => {
   console.clear()
   expect(checkValidity(testSudoku).ok).toBe(true)
})

test('if a cell has no candidates left the sudoku is invalid', () => {
   testSudoku.set(0, 0).to(/* nothing */)
   expect(checkValidity(testSudoku).ok).toBe(false)
})

test('a digit cannot appear twice in a row', () => {
   testSudoku.set(0, 0).to(4)
   testSudoku.set(0, 4).to(4)
   expect(checkValidity(testSudoku).ok).toBe(false)
})

test('a digit cannot appear twice in a column', () => {
   testSudoku.set(0, 0).to(4)
   testSudoku.set(4, 0).to(4)
   expect(checkValidity(testSudoku).ok).toBe(false)
})

test('a digit cannot appear twice in a box', () => {
   testSudoku.set(0, 0).to(4)
   testSudoku.set(1, 2).to(4)
   expect(checkValidity(testSudoku).ok).toBe(false)
})

test('it must be possible for each digit to be in a row', () => {
   for (let i: IndexToNine = 0; i < 9; i = i + 1 as IndexToNine) {
      testSudoku.set(0, i).to(1, 2, 3, 4, 5, 6, 7, 8)
   }
   expect(checkValidity(testSudoku).ok).toBe(false)
})

test('it must be possible for each digit to be in a column', () => {
   for (let i: IndexToNine = 0; i < 9; i = i + 1 as IndexToNine) {
      testSudoku.set(i, 0).to(1, 2, 3, 4, 5, 6, 7, 8)
   }
   expect(checkValidity(testSudoku).ok).toBe(false)
})

test('it must be possible for each digit to be in a box', () => {
   testSudoku.set(0, 0).to(1, 2, 3, 4, 5, 6, 7, 8)
   testSudoku.set(0, 1).to(1, 2, 3, 4, 5, 6, 7, 8)
   testSudoku.set(0, 2).to(1, 2, 3, 4, 5, 6, 7, 8)
   testSudoku.set(1, 0).to(1, 2, 3, 4, 5, 6, 7, 8)
   testSudoku.set(1, 1).to(1, 2, 3, 4, 5, 6, 7, 8)
   testSudoku.set(1, 2).to(1, 2, 3, 4, 5, 6, 7, 8)
   testSudoku.set(2, 0).to(1, 2, 3, 4, 5, 6, 7, 8)
   testSudoku.set(2, 1).to(1, 2, 3, 4, 5, 6, 7, 8)
   testSudoku.set(2, 2).to(1, 2, 3, 4, 5, 6, 7, 8)
   expect(checkValidity(testSudoku).ok).toBe(false)
})
