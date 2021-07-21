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
import { SuccessError } from "../Types";
import hiddenPairsTriplesAndQuads from "./hiddenPairsTriplesAndQuads";
import intersectionRemoval from "./intersectionRemoval";

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

         const testSudoku = Sudoku.fromRepresentation(testBoards["Solved board"])

         {
            solver.solved = NUMBER_OF_CELLS
            expect(checkForSolved(testSudoku, solver)).toStrictEqual({
               success: true,
               successcount: NUMBER_OF_CELLS
            })
            expect(solver.solved).toBe(NUMBER_OF_CELLS)
         }

         // Also check when the sudoku was just updated
         {
            solver.solved = 0
            expect(checkForSolved(testSudoku, solver)).toStrictEqual({
               success: true,
               successcount: NUMBER_OF_CELLS
            })
            expect(solver.solved).toBe(NUMBER_OF_CELLS)
         }

         expect(window._custom.alert).toHaveBeenCalledTimes(2)

         // @ts-expect-error
         window._custom.alert.mockClear()
      })

      test('succeeds when the sudoku has new solved cells', () => {
         solver.solved = 0
         const testSudoku = Sudoku.fromRepresentation(testBoards["Simple sudoku"])
         expect(checkForSolved(testSudoku, solver).success).toBe(true)
         expect(solver.solved).not.toBe(0)
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

         // The other cells candidates have changed
         expect(testSudoku.data[0][7]).not.toContain(1)
         expect(testSudoku.data[0][7]).not.toContain(4)
         expect(testSudoku.data[6][7]).not.toContain(4)
         expect(testSudoku.data[6][7]).not.toContain(9)
      })

      test("Doesn't update when there's nothing to update", () => {
         const testSudoku = new PureSudoku()
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
         expect(hiddenSingles(testSudoku, solver).success).toBe(false)
      })

      test("Empty sudoku = fail", () => {
         const testSudoku = new PureSudoku()
         expect(hiddenSingles(testSudoku, solver).success).toBe(false)
      })
   })

   describe('Pairs triples and quads', () => {
      test("Empty sudoku = fail", () => {
         const testSudoku = new PureSudoku()
         expect(pairsTriplesAndQuads(testSudoku, solver).success).toBe(false)
      })

      test('Pairs', () => {
         const testSudoku = new PureSudoku()
         testSudoku.set(0, 0).to(1, 2)
         testSudoku.set(0, 1).to(1, 2)
         expect(pairsTriplesAndQuads(testSudoku, solver).success).toBe(true)

         // Actual bug - same in box
         testSudoku.import(`
            ..8......
            ..7......
            ..1......
            ..5......
            .........
            .........
            ..6......
            ..9......
            ..3......
         `)
         updateCandidates(testSudoku, solver)
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

      test('Fails', () => {
         render(<App />)
         window._custom.alert = jest.fn()

         const testSudoku = new PureSudoku()
         testSudoku.import(`
            123456...
            456123...
            .........
            .........
            .........
            .........
            .........
            .........
            .........
         `)
         updateCandidates(testSudoku, solver)

         expect(pairsTriplesAndQuads(testSudoku, solver)).toStrictEqual({
            success: false,
            successcount: SuccessError
         })

         expect(window._custom.alert).toHaveBeenCalled()

         // @ts-expect-error
         window._custom.alert.mockClear()
      })

      test('When a conjugate is a subset of another', () => {
         // For example, say 4 cells have `1234`,
         // but 2 of those cells have `12`.

         const testSudoku = new PureSudoku()
         testSudoku.import(`
            123......
            45.......
            .........
            ..6......
            ..7......
            .........
            .........
            .........
            .........
         `)
         updateCandidates(testSudoku, solver)
         expect(pairsTriplesAndQuads(testSudoku, solver).success).toBe(true)
         expect(testSudoku.data[2][0]).not.toContain(8)
      })

      test('When 3 cells need 2 candidates', () => {
         const testSudoku = new PureSudoku()
         testSudoku.import(`
            123456...
            ......7..
            .........
            .........
            .........
            .........
            .........
            .........
            .........
         `)
         updateCandidates(testSudoku, solver)
         expect(pairsTriplesAndQuads(testSudoku, solver).successcount).toBe(SuccessError)
      })
   })

   describe('Hidden pairs, triples, and quads', () => {
      test('Empty sudoku = fail', () => {
         const testSudoku = new PureSudoku()
         expect(hiddenPairsTriplesAndQuads(testSudoku, solver).success).toBe(false)
      })

      test('Example 1', () => {
         const testSudoku = new PureSudoku()
         testSudoku.import(`
            .........
            ...78....
            78.......
            ......7..
            ......8..
            .........
            .........
            .........
            .........
         `)
         updateCandidates(testSudoku, solver)
         expect(hiddenPairsTriplesAndQuads(testSudoku, solver).success).toBe(true)
         expect(testSudoku.data[0][8]).toStrictEqual([7, 8])
         expect(testSudoku.data[8][8]).not.toStrictEqual([7, 8])
      })

      test('Example 2', () => {
         const testSudoku = new PureSudoku()
         testSudoku.import(`
            .......3.
            ........7
            4........
            81.73....
            ...851...
            ...2.4...
            2.......3
            .........
            .......7.
         `)
         updateCandidates(testSudoku, solver)
         expect(hiddenPairsTriplesAndQuads(testSudoku, solver).success).toBe(true)
         expect(testSudoku.data[4][6]).toStrictEqual([3, 7])
         expect(testSudoku.data[5][0]).not.toStrictEqual([3, 7])
      })

      test('Example 3', () => {
         const testSudoku = new PureSudoku()
         testSudoku.import(`
            .....1.3.
            2........
            .65......
            6.8.243..
            ....5...6
            ......7..
            ....6.57.
            ..6...84.
            .........
         `)
         updateCandidates(testSudoku, solver)
         expect(hiddenPairsTriplesAndQuads(testSudoku, solver).success).toBe(true)
         expect(hiddenPairsTriplesAndQuads(testSudoku, solver).success).toBe(true)
         expect(hiddenPairsTriplesAndQuads(testSudoku, solver).success).toBe(false)
      })

      // The only time no bug was discovered
      test('Example 4', () => {
         const testSudoku = new PureSudoku()
         testSudoku.import(`
            ...1234..
            .........
            .........
            ..1......
            ..2......
            ..3......
            ..4......
            .........
            .........
         `)
         updateCandidates(testSudoku, solver)
         expect(hiddenPairsTriplesAndQuads(testSudoku, solver).success).toBe(true)
      })

      // Unreal. Somehow every candidate in column 7 appears 2-4 times
      // The early eliminations do nothing
      test('Example 5', () => {
         const testSudoku = new PureSudoku()
         testSudoku.import(`
            +-----------------+--------------+---------------+
            | 6    5    139   | 13  8   7    | 19   2   4    |
            | 278  28   1378  | 6   4   9    | 18   5   37   |
            | 89   4    378   | 13  2   5    | 168  37  69   |
            +-----------------+--------------+---------------+
            | 5    7    29    | 4   3   8    | 29   6   1    |
            | 2489 2689 468   | 5   67  1    | 347  347 29   |
            | 3    1    46    | 9   67  2    | 47   8   5    |
            +-----------------+--------------+---------------+
            | 247  26   457   | 8   9   46   | 357  1   237  |
            | 4789 689  578   | 2   1   3    | 4567 47  67   |
            | 1    3    246   | 7   5   46   | 26   9   8    |
            +-----------------+--------------+---------------+
         `)
         expect(hiddenPairsTriplesAndQuads(testSudoku, solver)).toStrictEqual({
            success: true,
            successcount: 1
         })
      })

      test('Example 6 (should fail)', () => {
         const testSudoku = new PureSudoku()
         testSudoku.import(`
            .749.3...
            ....285..
            .........
            .....1...
            .2...54..
            ..67...8.
            9.......3
            .........
            .875.6..2
         `)
         updateCandidates(testSudoku, solver)
         expect(hiddenPairsTriplesAndQuads(testSudoku, solver)).toStrictEqual({
            success: false
         })
      })

      test('Examples 7, 8, and 9 (should error)', () => {
         const testSudoku = new PureSudoku()
         testSudoku.import(`
            123......
            ...123...
            ......4..
            .........
            .........
            .........
            .........
            .........
            .........
         `)
         updateCandidates(testSudoku, solver)
         expect(hiddenPairsTriplesAndQuads(testSudoku, solver).successcount).toBe(SuccessError)

         testSudoku.import(`
            ..3......
            ..2......
            ..1......
            .3.......
            .2.......
            .1.......
            4........
            .........
            .........
         `)
         updateCandidates(testSudoku, solver)
         expect(hiddenPairsTriplesAndQuads(testSudoku, solver).successcount).toBe(SuccessError)

         testSudoku.import(`
            .........
            .45......
            ...123...
            1........
            2........
            3........
            .........
            .........
            .........
         `)
         updateCandidates(testSudoku, solver)
         expect(hiddenPairsTriplesAndQuads(testSudoku, solver).successcount).toBe(SuccessError)
      })
   });

   describe('Intersection removal', () => {
      test('It works', () => {
         const testSudoku = new PureSudoku()
         testSudoku.import(`
            123......
            .........
            ......4..
            .........
            .........
            .........
            .........
            .........
            .........
         `)
         updateCandidates(testSudoku, solver)
         expect(intersectionRemoval(testSudoku, solver).success).toBe(true)
         expect(testSudoku.data[1][3]).toStrictEqual([1, 2, 3, 5, 6, 7, 8, 9])
      })

      test('Box/line reduction', () => {
         const testSudoku = new PureSudoku()
         testSudoku.import(`
            .........
            .........
            .........
            .........
            ...4.....
            .........
            .....5...
            .....6...
            ......4..
         `)
         updateCandidates(testSudoku, solver)
         expect(intersectionRemoval(testSudoku, solver).success).toBe(true)
         expect(testSudoku.data[0][4]).toStrictEqual([1, 2, 3, 5, 6, 7, 8, 9])
      })
   });
})
