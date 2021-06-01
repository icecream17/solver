import PureSudoku from "./PureSudoku"
import Strategies, { checkValidity } from "./Strategies"
import testBoards from "./boards"
import Solver from "./Solver";
import Sudoku from "./Sudoku";
import { IndexToNine, MAX_CELL_INDEX } from "../Types";
import { render } from "@testing-library/react";
import App from "../App";

describe('checkValidity', () => {
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
})

describe('strategies', () => {
   let solver: Solver;

   beforeEach(() => {
      solver = Object.create(Solver)
      solver.strategyIndex = 0
      solver.solved = 0
      solver.strategyItemElements = []
   })

   describe('check for solved', () => {
      const checkForSolved = Strategies[0]

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
         render(<App />)
         window._custom.alert = jest.fn()

         solver.solved = MAX_CELL_INDEX
         const testSudoku = Sudoku.from81(testBoards["Solved board"])
         expect(checkForSolved(testSudoku, solver).success).toBe(true)

         expect(window._custom.alert).toHaveBeenCalled()

         // @ts-ignore
         window._custom.alert.mockClear()
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

   describe('update candidates', () => {
      const updateCandidates = Strategies[1]

      test('Actually updates', () => {
         // Just one candidate
         let testSudoku = new PureSudoku({ setup: true })
         testSudoku.set(7, 7).to(4)
         expect(updateCandidates(testSudoku, solver).success).toBe(true)

         // The last candidate
         testSudoku.set(8, 8).to(9)
         expect(updateCandidates(testSudoku, solver).success).toBe(true)

         // The first candidate
         testSudoku.set(0, 0).to(1)
         expect(updateCandidates(testSudoku, solver).success).toBe(true)
      })

      test("Doesn't update when there's nothing to update", () => {
         const testSudoku = new Sudoku({ setup: true })
         expect(updateCandidates(testSudoku, solver).success).toBe(false)
      })
   })
})
