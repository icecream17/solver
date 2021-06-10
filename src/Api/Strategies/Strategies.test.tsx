import PureSudoku from "../PureSudoku"
import testBoards from "../boards"
import Solver from "../Solver";
import Sudoku from "../Sudoku";
import { NUMBER_OF_CELLS } from "../../Types";
import { render } from "@testing-library/react";
import App from "../../App";
import checkForSolved from "./checkForSolved";
import hiddenSingles from "./hiddenSingles";
import updateCandidates from "./updateCandidates";
import pairsTriplesAndQuads from "./pairsTriplesAndQuads";

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
         const testSudoku = PureSudoku.fromRepresentation(testBoards["Solved board"])

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

         solver.solved = NUMBER_OF_CELLS
         const testSudoku = Sudoku.fromRepresentation(testBoards["Solved board"])
         expect(checkForSolved(testSudoku, solver)).toStrictEqual({
            success: true,
            successcount: NUMBER_OF_CELLS
         })

         // Also check when the sudoku was just updated
         solver.solved = 0
         expect(checkForSolved(testSudoku, solver)).toStrictEqual({
            success: true,
            successcount: NUMBER_OF_CELLS
         })

         expect(window._custom.alert).toHaveBeenCalledTimes(2)

         // @ts-ignore
         window._custom.alert.mockClear()
      })

      test('succeeds when the sudoku has new solved cells', () => {
         const testSudoku = Sudoku.fromRepresentation(testBoards["Solved board"])
         expect(checkForSolved(testSudoku, solver).success).toBe(true)
      })

      test('fails when the sudoku doesnt have any new solved cells', () => {
         const testSudoku = new Sudoku()
         expect(checkForSolved(testSudoku, solver).success).toBe(false)
      })
   })

   describe('update candidates', () => {
      test('Actually updates', () => {
         // Just one candidate
         let testSudoku = new PureSudoku()
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
         const testSudoku = new Sudoku()
         expect(updateCandidates(testSudoku, solver).success).toBe(false)
      })
   })

   describe('hiddenSingles', () => {
      test("It works", () => {
         const testSudoku = new PureSudoku()
         testSudoku.set(2, 7).to(5)
         testSudoku.set(3, 6).to(5)
         testSudoku.set(6, 8).to(1)
         testSudoku.set(7, 8).to(2)
         updateCandidates(testSudoku, solver)
         expect(hiddenSingles(testSudoku, solver).success).toBe(true)

         // Make sure it doesn't change anything
         expect(testSudoku.data[2][7]).toStrictEqual([5])
      })

      test("Doesn't false positive with just regular singles", () => {
         const testSudoku = new PureSudoku()
         testSudoku.set(2, 7).to(5)
         testSudoku.set(7, 8).to(2)
         updateCandidates(testSudoku, solver)
         expect(updateCandidates(testSudoku, solver).success).toBe(false)
      })
   })

   describe('Pairs triples and quads', () => {
      test('Pairs', () => {
         const testSudoku = new PureSudoku()
         testSudoku.set(0, 0).to(1, 2)
         testSudoku.set(0, 1).to(1, 2)
         expect(pairsTriplesAndQuads(testSudoku, solver).success).toBe(true)

      })

      test('Quads', () => {
         const testSudoku = new PureSudoku()
         testSudoku.set(3, 3).to(2, 3, 7, 8) // < the quad
         testSudoku.set(3, 4).to(2, 3, 5, 8, 9)
         testSudoku.set(3, 5).to(2, 4, 6, 8)
         testSudoku.set(4, 3).to(2, 7, 8) // <
         testSudoku.set(4, 4).to(1, 7, 8)
         testSudoku.set(4, 5).to(2, 3, 5, 6, 8)
         testSudoku.set(5, 3).to(1, 6, 8, 9)
         testSudoku.set(5, 4).to(2, 8) // <
         testSudoku.set(5, 5).to(3, 7, 8) // <
         expect(pairsTriplesAndQuads(testSudoku, solver).success).toBe(true)
      })

      test('No cell contains all candidates', () => {
         const testSudoku = new PureSudoku()
         testSudoku.clear()
         testSudoku.set(0, 0).to(1, 2)
         testSudoku.set(0, 1).to(2, 3)
         testSudoku.set(0, 2).to(3, 1)
         expect(pairsTriplesAndQuads(testSudoku, solver).success).toBe(true)
      })
   })
})
