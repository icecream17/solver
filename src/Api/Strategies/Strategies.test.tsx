import PureSudoku from "../PureSudoku"
import testBoards from "../boards"
import Solver from "../Solver";
import Sudoku from "../Sudoku";
import { MAX_CELL_INDEX } from "../../Types";
import { render } from "@testing-library/react";
import App from "../../App";
import checkForSolved from "./checkForSolved";
import hiddenSingles from "./hiddenSingles";
import updateCandidates from "./updateCandidates";

describe('strategies', () => {
   let solver: Solver;

   beforeEach(() => {
      solver = Object.create(Solver)
      solver.strategyIndex = 0
      solver.solved = 0
      solver.strategyItemElements = []
   })

   describe('check for solved', () => {
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

   describe('hiddenSingles', () => {
      test("It works", () => {
         const testSudoku = new PureSudoku({ setup: true })
         testSudoku.set(2, 7).to(5)
         testSudoku.set(3, 6).to(5)
         testSudoku.set(6, 8).to(1)
         testSudoku.set(7, 8).to(2)
         updateCandidates(testSudoku, solver)
         expect(hiddenSingles(testSudoku, solver).success).toBe(true)
      })
   })
})
