import PureSudoku from "./PureSudoku"
import Strategies, { checkValidity } from "./Strategies"
import testBoards from "./boards"
import Solver from "./Solver";
import Sudoku from "./Sudoku";
import { MAX_CELL_INDEX } from "../Types";

describe('checkValidity', () => {
   let testSudoku: PureSudoku;

   beforeEach(() => {
      testSudoku = new PureSudoku({ setup: true })
   })

   test('a blank sudoku is valid (subject to change)', () => {
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
})

describe('check for solved', () => {
   const checkForSolved = Strategies[0]
   let solver: Solver;

   beforeEach(() => {
      solver = Object.create(Solver)
      solver.solved = 0
   })

   test('error if solver.solved is invalid', () => {
      const testSudoku = Sudoku.from81(testBoards["Solved board"])

      // @ts-expect-error
      solver.solved = undefined
      expect(() => checkForSolved(testSudoku, solver)).toThrow(TypeError)

      solver.solved = 0.5
      expect(() => checkForSolved(testSudoku, solver)).toThrow(TypeError)

      solver.solved = -2
      expect(() => checkForSolved(testSudoku, solver)).toThrow(TypeError)

      solver.solved = Infinity
      expect(() => checkForSolved(testSudoku, solver)).toThrow(TypeError)
   })

   test('succeeds when sudoku is finished', () => {
      window.alert = jest.fn()

      solver.solved = MAX_CELL_INDEX
      const testSudoku = Sudoku.from81(testBoards["Solved board"])
      expect(checkForSolved(testSudoku, solver).success).toBe(true)

      expect(window.alert).toHaveBeenCalled()

      // @ts-ignore
      window.alert.mockClear()
   })

   test('succeeds when the sudoku has new solved cells', () => {
      const testSudoku = Sudoku.from81(testBoards["Solved board"])
      expect(checkForSolved(testSudoku, solver).success).toBe(true)
   })

   test('fails when the sudoku doesnt have any new solved cells', () => {
      const testSudoku = new Sudoku({ setup: true })
      expect(checkForSolved(testSudoku, solver).success).toBe(false)
   })
})
