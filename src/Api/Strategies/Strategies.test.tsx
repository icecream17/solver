
import PureSudoku from "../Spaces/PureSudoku"
import testBoards from "../boards"
import Solver from "../Solver";
import { NUMBER_OF_CELLS } from "../../Types";
import { render } from "@testing-library/react";
import App from "../../App";
import checkForSolved from "./checkForSolved";
import hiddenSingles from "./hiddenSingles";
import updateCandidates from "./updateCandidates";
import pairsTriplesAndQuads from "./pairsTriplesAndQuads";
import { PureStrategy, Strategy, StrategyMemory, SuccessError } from "../Types";
import hiddenPairsTriplesAndQuads from "./hiddenPairsTriplesAndQuads";
import intersectionRemoval from "./intersectionRemoval";
import STRATEGIES from "./Strategies";
import xWing from "./xWing";
import checkValidity from "./checkValidity";
import swordfish from "./swordfish";
import jellyfish from "./jellyfish";
import skyscraper from "./skyscraper";
import boards from "../boards";
import yWing from "./yWing";
import twoMinusOneLines from "./twoMinusOneLines";
import xyLoop from "./xyLoop";
import xyChain from "./xyChain";
import xyzWing from "./xyzWing";
import twoStringKite from "./twoStringKite";
import wWing from "./wWing";
import pairCoversGroup from "./pairCoversGroup";

function setupSudoku (representation: string) {
   const testSudoku = new PureSudoku(representation)
   updateCandidates(testSudoku)
   return testSudoku
}

/**
 * Returns testSudoku as a side effect
 * TODO: This is a bad function
 */
function testStrategy (representation: string, strategy: PureStrategy, shouldSucceed: boolean) {
   const testSudoku = setupSudoku(representation)
   expect(strategy(testSudoku).success).toBe(shouldSucceed)
   return testSudoku
}

describe('strategies', () => {
   let solver: Solver;

   beforeEach(() => {
      solver = Object.create(Solver) as Solver
      solver.strategyIndex = 0
      solver.memory = new StrategyMemory()
   })

   test.each([...STRATEGIES.entries()])('$variable.name fails on an empty sudoku', (index: number, strategy: Strategy) => {
      const testSudoku = new PureSudoku()
      expect(strategy(testSudoku, solver.memory[index]).success).toBe(false)
   })

   describe('check for solved', () => {
      test('error if solver.solved is invalid', () => {
         const testSudoku = PureSudoku.fromRepresentation(testBoards["Solved board"])

         // @ts-expect-error obv
         solver.memory[0].solved = undefined
         expect(() => checkForSolved(testSudoku, solver.memory[0])).toThrow(TypeError)

         solver.memory[0].solved = 0.5
         expect(() => checkForSolved(testSudoku, solver.memory[0])).toThrow(TypeError)

         solver.memory[0].solved = -2
         expect(() => checkForSolved(testSudoku, solver.memory[0])).toThrow(TypeError)

         solver.memory[0].solved = Infinity
         expect(() => checkForSolved(testSudoku, solver.memory[0])).toThrow(TypeError)
      })

      test('succeeds when sudoku is finished', () => {
         const testSudoku = PureSudoku.fromRepresentation(testBoards["Solved board"])

         {
            solver.memory[0].solved = NUMBER_OF_CELLS
            expect(checkForSolved(testSudoku, solver.memory[0])).toStrictEqual({
               success: true,
               successcount: NUMBER_OF_CELLS
            })
            expect(solver.memory[0].solved).toBe(NUMBER_OF_CELLS)
         }

         // Also check when the sudoku was just updated
         {
            solver.memory[0].solved = 0
            expect(checkForSolved(testSudoku, solver.memory[0])).toStrictEqual({
               success: true,
               successcount: NUMBER_OF_CELLS
            })
            expect(solver.memory[0].solved).toBe(NUMBER_OF_CELLS)
         }
      })

      // solver.solved is set in the beforeEach
      test('succeeds when the sudoku has new solved cells', () => {
         const testSudoku = PureSudoku.fromRepresentation(testBoards["Simple sudoku"])
         expect(checkForSolved(testSudoku, solver.memory[0]).success).toBe(true)
         expect(solver.memory[0].solved).not.toBe(0)
      })

      test('and then fails when the sudoku doesnt have any new solved cells', () => {
         const testSudoku = PureSudoku.fromRepresentation(testBoards["Simple sudoku"])
         checkForSolved(testSudoku, solver.memory[0])
         expect(checkForSolved(testSudoku, solver.memory[0]).success).toBe(false)
      })
   })

   describe('update candidates', () => {
      test('Actually updates', () => {
         // Just one candidate
         const testSudoku = new PureSudoku()
         testSudoku.set(7, 7).to(4)
         expect(updateCandidates(testSudoku).success).toBe(true)

         // The last candidate
         testSudoku.set(8, 8).to(9)
         expect(updateCandidates(testSudoku).success).toBe(true)

         // The first candidate
         testSudoku.set(0, 0).to(1)
         expect(updateCandidates(testSudoku).success).toBe(true)

         // The other cells candidates have changed
         expect(testSudoku.data[0][7]).not.toContain(1)
         expect(testSudoku.data[0][7]).not.toContain(4)
         expect(testSudoku.data[6][7]).not.toContain(4)
         expect(testSudoku.data[6][7]).not.toContain(9)
      })
   })

   describe('hiddenSingles', () => {
      test("It works", () => {
         const testSudoku = new PureSudoku()
         testSudoku.set(2, 7).to(5)
         testSudoku.set(3, 6).to(5)
         testSudoku.set(6, 8).to(1)
         testSudoku.set(7, 8).to(2)
         updateCandidates(testSudoku)
         expect(hiddenSingles(testSudoku).success).toBe(true)

         // Make sure it doesn't change anything
         expect(testSudoku.data[2][7]).toStrictEqual([5])
      })

      test("Doesn't false positive with just regular singles", () => {
         const testSudoku = new PureSudoku()
         testSudoku.set(2, 7).to(5)
         testSudoku.set(7, 8).to(2)
         updateCandidates(testSudoku)
         expect(hiddenSingles(testSudoku).success).toBe(false)
      })
   })

   describe('Pairs triples and quads', () => {
      test('Pairs', () => {
         const testSudoku = new PureSudoku()
         testSudoku.set(0, 0).to(1, 2)
         testSudoku.set(0, 1).to(1, 2)
         expect(pairsTriplesAndQuads(testSudoku).success).toBe(true)

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
         updateCandidates(testSudoku)
         expect(pairsTriplesAndQuads(testSudoku).success).toBe(true)
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
         expect(pairsTriplesAndQuads(testSudoku).success).toBe(true)
      })

      test('No cell contains all candidates', () => {
         const testSudoku = new PureSudoku()
         testSudoku.clear()
         testSudoku.set(0, 0).to(1, 2)
         testSudoku.set(0, 1).to(2, 3)
         testSudoku.set(0, 2).to(3, 1)
         expect(pairsTriplesAndQuads(testSudoku).success).toBe(true)
      })

      test('Fails', () => {
         render(<App />)
         jest.spyOn(window._custom, 'alert').mockImplementation()

         const testSudoku = setupSudoku(`
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

         expect(pairsTriplesAndQuads(testSudoku)).toStrictEqual({
            success: false,
            successcount: SuccessError
         })

         expect(window._custom.alert).toHaveBeenCalled()
         jest.restoreAllMocks()
      })

      test('When a conjugate is a subset of another', () => {
         // For example, say 4 cells have `1234`,
         // but 2 of those cells have `12`.

         const testSudoku = testStrategy(`
            123......
            45.......
            .........
            ..6......
            ..7......
            .........
            .........
            .........
            .........
         `, pairsTriplesAndQuads, true)
         expect(testSudoku.data[2][0]).toStrictEqual([6, 7])
      })

      test('When 3 cells need 2 candidates', () => {
         const testSudoku = setupSudoku(`
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
         expect(pairsTriplesAndQuads(testSudoku).successcount).toBe(SuccessError)
      })
   })

   describe('Hidden pairs, triples, and quads', () => {
      test('Example 1', () => {
         const testSudoku = testStrategy(`
            .........
            ...78....
            78.......
            ......7..
            ......8..
            .........
            .........
            .........
            .........
         `, hiddenPairsTriplesAndQuads, true)
         expect(testSudoku.data[0][8]).toStrictEqual([7, 8])
         expect(testSudoku.data[8][8]).not.toStrictEqual([7, 8])
      })

      test('Example 2', () => {
         const testSudoku = testStrategy(`
            .......3.
            ........7
            4........
            81.73....
            ...851...
            ...2.4...
            2.......3
            .........
            .......7.
         `, hiddenPairsTriplesAndQuads, true)
         expect(testSudoku.data[4][6]).toStrictEqual([3, 7])
         expect(testSudoku.data[5][0]).not.toStrictEqual([3, 7])
      })

      test('Example 3', () => {
         const testSudoku = setupSudoku(`
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
         expect(hiddenPairsTriplesAndQuads(testSudoku).success).toBe(true)
         expect(hiddenPairsTriplesAndQuads(testSudoku).success).toBe(true)
         expect(hiddenPairsTriplesAndQuads(testSudoku).success).toBe(false)
      })

      // The only time no bug was discovered
      test('Example 4', () => {
         testStrategy(`
            ...1234..
            .........
            .........
            ..1......
            ..2......
            ..3......
            ..4......
            .........
            .........
         `, hiddenPairsTriplesAndQuads, true)
      })

      // Unreal. Somehow every candidate in column 7 appears 2-4 times
      // The early eliminations do nothing
      test('Example 5', () => {
         const testSudoku = new PureSudoku(`
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
         expect(hiddenPairsTriplesAndQuads(testSudoku)).toStrictEqual({
            success: true,
            successcount: 1
         })
      })

      test('Example 6 (should fail)', () => {
         const testSudoku = setupSudoku(`
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
         expect(hiddenPairsTriplesAndQuads(testSudoku)).toStrictEqual({
            success: false
         })
      })

      test('Examples 7, 8, 9, and 10 (should error)', () => {
         const testSudoku = setupSudoku(`
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
         expect(hiddenPairsTriplesAndQuads(testSudoku).successcount).toBe(SuccessError)

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
         updateCandidates(testSudoku)
         expect(hiddenPairsTriplesAndQuads(testSudoku).successcount).toBe(SuccessError)

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
         updateCandidates(testSudoku)
         expect(hiddenPairsTriplesAndQuads(testSudoku).successcount).toBe(SuccessError)

         testSudoku.import('020000700020006700000006700020000700000400089000400089000400009100000080100000089123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789')
         expect(hiddenPairsTriplesAndQuads(testSudoku).successcount).toBe(SuccessError)
      })

      test('Example 11 (Should succeed AND eliminate)', () => {
         // Wow
         const testSudoku = new PureSudoku('...4567.9...4..7.9.2..........4567.9..3.........4567.91...........4.6..9.......8....4567.9...4..7.9.....67.91...........4..7.9.......8...3.......2.4.6..9.2....7.9.......8...3......1...........4.67.9.2..........4.67.9....5.......4.6..9......7.9..3.....9.....6.....3....89.......89....5....1.........2.............7.....4...........7.91..........3...789.2.4..789...4..7.9.234..7.9.......89....5.........6....2...........5.......4...........789.....6.........7.9.......89..3......1........1.........2.4..7.9..3...7.9...4..7.9.......8....4..7.9.....6....2......9....5.......4.6..9.2.....8......6..9.2..5.......4....9.2..5..........7..1..........3...........67.9.2....7.9....5......3......1.........2...67.9...4............8..2......9')
         expect(hiddenPairsTriplesAndQuads(testSudoku).success).toBe(true)
         expect(testSudoku.data[8][5]).not.toContain(7)
      })
   });

   describe('Intersection removal', () => {
      test('It works', () => {
         const testSudoku = testStrategy(`
            123......
            .........
            ......4..
            .........
            .........
            .........
            .........
            .........
            .........
         `, intersectionRemoval, true)
         expect(testSudoku.data[1][3]).toStrictEqual([1, 2, 3, 5, 6, 7, 8, 9])
      })

      test('Box/line reduction', () => {
         const testSudoku = testStrategy(`
            .........
            .........
            .........
            .........
            ...4.....
            .........
            .....5...
            .....6...
            ......4..
         `, intersectionRemoval, true)
         expect(testSudoku.data[0][4]).toStrictEqual([1, 2, 3, 5, 6, 7, 8, 9])
      })
   });

   describe('X wing', () => {
      test('1', () => {
         const testSudoku = testStrategy(`
            1........
            .........
            ...23..54
            ...67..89
            .........
            ..1......
            .........
            .........
            .........
         `, xWing, true)
         expect(testSudoku.data[5][2]).toStrictEqual([1])
         expect(testSudoku.data[7][5]).toStrictEqual([2, 3, 4, 5, 6, 7, 8, 9])
      })

      test('2', () => {
         const testSudoku = testStrategy(`
            +----------------+--------------+--------------+
            | 2589 1   258   | 69  3   7    | 58  4   56   |
            | 4789 38  478   | 69  2   5    | 378 1   67   |
            | 6    35  57    | 4   1   8    | 357 2   9    |
            +----------------+--------------+--------------+
            | 25   7   3     | 1   4   9    | 6   8   25   |
            | 1    256 245   | 8   7   26   | 245 9   3    |
            | 248  268 9     | 3   5   26   | 124 7   14   |
            +----------------+--------------+--------------+
            | 3    9   17    | 2   6   4    | 17  5   8    |
            | 27   4   6     | 5   8   1    | 9   3   27   |
            | 258  258 1258  | 7   9   3    | 124 6   14   |
            +----------------+--------------+--------------+
         `, xWing, true)
         expect(checkValidity(testSudoku)).toStrictEqual({ ok: true as true })
      })
   })

   describe('Swordfish', () => {
      test('1', () => {
         const testSudoku = testStrategy(`
            000000000
            100200300
            200300400
            300400500
            400500600
            500600700
            600700800
            000000000
            000000000
         `, swordfish, true)
         expect(checkValidity(testSudoku)).toStrictEqual({ ok: true as true })
      })

      test('2', () => {
         testStrategy(`
            +--------------+---------------+----------------+
            | 9   8   47   | 346 1   346   | 5   2   3467   |
            | 135 136 2    | 7   568 3468  | 9   68  3468   |
            | 35  36  47   | 2   568 9     | 46  1   34678  |
            +--------------+---------------+----------------+
            | 7   123 13   | 5   4   26    | 8   9   16     |
            | 6   5   8    | 1   9   7     | 3   4   2      |
            | 4   12  9    | 68  3   268   | 16  7   5      |
            +--------------+---------------+----------------+
            | 138 4   6    | 9   7   138   | 2   5   18     |
            | 2   9   13   | 34  68  5     | 7   68  14     |
            | 18  7   5    | 468 2   1468  | 146 3   9      |
            +--------------+---------------+----------------+
         `, swordfish, true)
      })

      test('3', () => {
         const testSudoku = setupSudoku(boards["swordfish wow"])
         hiddenPairsTriplesAndQuads(testSudoku)
         expect(swordfish(testSudoku).success).toBe(true)
      })
   })

   describe('Jellyfish', () => {
      test('1', () => {
         testStrategy(`
            +------------------+--------------+-------------------+
            | 3589  4   589    | 289 7   268  | 2569  1    2359   |
            | 1789  19  2      | 3   5   168  | 4679  469  79     |
            | 13579 6   1579   | 249 24  12   | 2579  8    23579  |
            +------------------+--------------+-------------------+
            | 2     159 14589  | 46  3   7    | 14569 4569 1589   |
            | 58    3   458    | 1   468 9    | 4567  2    578    |
            | 6     7   1489   | 245 248 25   | 3     49   189    |
            +------------------+--------------+-------------------+
            | 4     15  3      | 258 9   258  | 128   7    6      |
            | 159   8   1569   | 7   26  4    | 1259  3    1259   |
            | 79    2   679    | 568 1   3    | 589   59   4      |
            +------------------+--------------+-------------------+
         `, jellyfish, true)
      })
   })


   describe('Skyscraper', () => {
      test('1', () => {
         testStrategy(`
            .........
            .........
            4.5.67..8
            1.3.89.5.
            .........
            .........
            .2.......
            ......2..
            .........
         `, skyscraper, true)
      })

      test('2', () => {
         testStrategy(`
            .4.......
            ......5..
            .8....6..
            ...7.....
            .5....4..
            .3....9..
            ....7....
            .........
            .1....2..
         `, skyscraper, true)
      })

      test('3', () => {
         testStrategy(`
            .........
            ....4....
            ......4..
            ........7
            .........
            .....6..8
            .........
            ...4.....
            ........9
         `, skyscraper, false)
      })
   })


   describe('Y wing', () => {
      test('1', () => {
         const testSudoku = new PureSudoku()
         testSudoku.set(1, 1).to(1, 2) // AB
         testSudoku.set(2, 2).to(1, 3) // AC
         testSudoku.set(3, 1).to(2, 3) // BC

         updateCandidates(testSudoku)
         expect(yWing(testSudoku).success).toBe(true)
      })

      test('2', () => {
         const testSudoku = new PureSudoku()
         testSudoku.set(2, 2).to(1, 2) // AB
         testSudoku.set(2, 5).to(1, 3) // AC
         testSudoku.set(0, 1).to(2, 3) // BC

         updateCandidates(testSudoku)
         expect(yWing(testSudoku).success).toBe(true)
      })

      test('3', () => {
         const testSudoku = new PureSudoku()
         testSudoku.set(0, 0).to(1, 2) // AB
         testSudoku.set(0, 1).to(1, 2) // AC
         testSudoku.set(0, 4).to(2, 3) // BC

         updateCandidates(testSudoku)
         expect(yWing(testSudoku).success).toBe(false)
      })

      test('4', () => {
         const testSudoku = setupSudoku(`
            +-----------+-------------+------------+
            | 35 69  2  | 8   579 4   | 79  3679 1 |
            | 35 19  4  | 179 6   159 | 2   379  8 |
            | 8  7   16 | 3   2   19  | 4   69   5 |
            +-----------+-------------+------------+
            | 9  2   3  | 6   1   8   | 57  57   4 |
            | 4  18  5  | 279 79  29  | 6   18   3 |
            | 7  168 16 | 5   4   3   | 18  2    9 |
            +-----------+-------------+------------+
            | 2  5   8  | 19  3   7   | 19  4    6 |
            | 6  4   9  | 12  8   125 | 3   15   7 |
            | 1  3   7  | 4   59  6   | 589 589  2 |
            +-----------+-------------+------------+
         `)

         expect(yWing(testSudoku).success).toBe(true)
         expect(yWing(testSudoku).success).toBe(true)
         expect(yWing(testSudoku).success).toBe(true)
         expect(yWing(testSudoku).success).toBe(true)
      })
   })


   describe('twoMinusOneLines', () => {
      test('1', () => {
         const testSudoku = testStrategy(`
            ....23...
            ......1..
            .........
            .76.54...
            .......1.
            .........
            8........
            .........
            .........
         `, twoMinusOneLines, true)
         expect(testSudoku.data[0][0]).toContain(1)
      })
   })

   describe('xyLoop', () => {
      test('1', () => {
         testStrategy(`
            .........
            ..8.4.1..
            .1.2.3.9.
            ..4...6..
            .7.....2.
            ..1...5..
            .2.3.7.1.
            ..5.6.4..
            .........
         `, xyLoop, true)
      })

      test('2', () => {
         testStrategy(`000000080020000000003006009003006000003400000100000000000050000000000700000400009003400000103400009003006009023006700000050000020000709000400009000000080120000000000050000100400009000000700000000080000400009020000009000006000003000000120000000003400000003400000020000000000000009000006000000050000000000080100000000000000700000000709000006000000000080003000700100000000003400700003400009020000000000050000000000709000050000100000000023000700000000080023400700003400009000006000000400009020000000003000009000400000100000000003000009000000080000000700000050000000006000000006000000000700003000009000050000020000000003000009100000000000400000000000080100000000000000080000050000000400000000000700000006000020000000000000009003000000`,
            xyLoop, true)
      })

      test('Not xy chain', () => {
         testStrategy(`000006000003000000000400000000000700000000009020000000100000080100000080000050000020000000000000009000000080000050000100000000000006000000000700000400000003000000100000000000000700000050000003000080003000080000400000000006000000000009020000000000000780020450000100000700000006000003450000100050000103050080120000780000000009000000089020450000100006009023000009000000700100050009103050080120000080000406000003000000020450000100006709020000009000450000000000080100050000120000700000406000000050000000000080020000000000400000000006000000000700000000009003000000100000000000400000100000000003000000000000089000050080000050009020000000000006000000000700000000709000006000000000709100000000020000000003000000000400000000050000000000080`,
            xyLoop, false)
      })
   })

   describe('xyChain', () => {
      test('1', () => {
         const testSudoku = new PureSudoku()
         testSudoku.import(`000006000003000000000400000000000700000000009020000000100000080100000080000050000020000000000000009000000080000050000100000000000006000000000700000400000003000000100000000000000700000050000003000080003000080000400000000006000000000009020000000000000780020450000100000700000006000003450000100050000103050080120000780000000009000000089020450000100006009023000009000000700100050009103050080120000080000406000003000000020450000100006709020000009000450000000000080100050000120000700000406000000050000000000080020000000000400000000006000000000700000000009003000000100000000000400000100000000003000000000000089000050080000050009020000000000006000000000700000000709000006000000000709100000000020000000003000000000400000000050000000000080`)
         expect(xyChain(testSudoku).success).toBe(true)
      })

      test('2', () => {
         const testSudoku = new PureSudoku()
         testSudoku.import(`000000080020000000000006009003006000003400000100000000000050000000000700000400009003400000100000000003006009000006700000050000000000709000400009000000080020000000000050000000400009000000700000000080000400009020000000000006000003000000100000000003400000003400000020000000000000009000006000000050000000000080100000000000000700000000709000006000000000080003000700100000000003400700003400009020000000000050000000000709000050000100000000020000000000000080003400700003400009000006000000400009020000000003000009000400000100000000003000009000000080000000700000050000000006000000006000000000700003000009000050000020000000003000009100000000000400000000000080100000000000000080000050000000400000000000700000006000020000000000000009003000000`)
         expect(xyChain(testSudoku).success).toBe(true)
      })

      test('3', () => {
         const testSudoku = new PureSudoku()
         testSudoku.import(`000000700023400000023400000000050000003400000000006080000000009100000080100006000003406080003406080003400080103000000103400000000000009020000000000050000000000700000050000100000000000000009020000080020000700000006780000006080003000000000400000020006000000050000000000700120000000000000080003000000000400000000000009100006000000406080000406080100000000000000700000000009000050000000006080020000000003000000023000080000000009023000080000006000120000000000400000000000700100000080000050000020000080020000080000050000000400000000006000100000000003000000000000700000000009100000009003400700003400000003000089003050700000000780100050000000006000020000000100000009003000700000006000003000009003050700020000000100050000000400000000000080`)
         expect(xyChain(testSudoku).success).toBe(true)
         expect(checkValidity(testSudoku)).toStrictEqual({ ok: true as true })
      })

      test('4', () => {
         const testSudoku = new PureSudoku()
         testSudoku.import(`123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789120000000123456789023000000123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789003400000123456789123456789123456789123456789123456789123456789123456789100400000123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789`)
         expect(xyChain(testSudoku).success).toBe(true)
      })

      test('5', () => {
         const testSudoku = new PureSudoku()
         testSudoku.import(`123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789120000000123456789103000000123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789003400000123456789123456789100400000123456789123456789123456789123456789123456789123456789123456789123456789123456789120000000123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789`)
         expect(xyChain(testSudoku).success).toBe(true)
         expect(testSudoku.data[1][7]).toContain(1)
      })
   })

   describe('wWing', () => {
      test('1', () => {
         const testSudoku = new PureSudoku()
         testSudoku.import(boards["w wing"])
         updateCandidates(testSudoku)

         // These are necessary because they allow a certain bug to happen
         // where row 6 has only two 2s
         intersectionRemoval(testSudoku)
         pairsTriplesAndQuads(testSudoku)

         // Necessary so that 279 -> 27
         xWing(testSudoku)

         expect(wWing(testSudoku).success).toBe(true)

         // Check for bug
         expect(testSudoku.data[5][3]).toContain(7)
      })
   })

   describe('pair covers group', () => {
      test('elimination A and B', () => {
         const testSudoku = new PureSudoku('123456789123456789123456789....56...1234567891234567891234567891234567891234567891234567891.........2.......123456789123456789123456789123456789123456789123456789123456789..3.........4.....123456789123456789123456789123456789123456789123456789....56...123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789')
         expect(pairCoversGroup(testSudoku).success).toBe(true)
         expect(testSudoku.data[0][0]).not.toContain(5)
         expect(testSudoku.data[0][0]).not.toContain(6)
         expect(testSudoku.data[3][3]).not.toContain(5)
         expect(testSudoku.data[3][3]).not.toContain(6)
         expect(testSudoku.data[4][0]).not.toContain(5)
         expect(testSudoku.data[4][0]).not.toContain(6)
      })

      test('elimination B', () => {
         const testSudoku = new PureSudoku('1.........2.........3......123456789123456789123456789123456789123456789123456789123456789123456789123456789...45....123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789...45....123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789')
         expect(pairCoversGroup(testSudoku).success).toBe(true)
         expect(testSudoku.data[1][4]).not.toContain(4)
         expect(testSudoku.data[1][4]).not.toContain(5)
      })

      test('Example', () => {
         const testSudoku = new PureSudoku(boards["w wing 2?"])
         expect(pairCoversGroup(testSudoku).success).toBe(true)
         expect(testSudoku.data[1][4]).toContain(7)
         expect(testSudoku.data[2][5]).toContain(1)
         expect(testSudoku.data[8][8]).not.toContain(1)
      })

      test('Works even when the pair sees each other', () => {
         const testSudoku = new PureSudoku("1.........2.........3.........456789...456789...456789...456789...456789...456789...456789...456789...456789...45....123456789123456789...45....123456789123456789...456789...456789...456789123456789123456789123456789123456789123456789123456789.234567891.345678912.456789123456789123456789123456789123456789123456789123456789.234567891.345678912.456789123456789123456789123456789123456789123456789123456789.234567891.345678912.456789123456789123456789123456789123456789123456789123456789.234567891.345678912.456789123456789123456789123456789123456789123456789123456789.234567891.345678912.456789123456789123456789123456789123456789123456789123456789.234567891.345678912.456789123456789123456789123456789123456789123456789123456789")
         expect(pairCoversGroup(testSudoku).success).toBe(true)
      })

      test('Should fail', () => {
         const testSudoku = new PureSudoku("123.56..9123.56..9123.56..9123.56..9123.567.9.......8....4.....123.56..9123.567.9123.56.89123.56.89123.56.89123.56..91234567.9...4..7..123.56789123.56.89123.56789...4.....123.56.89......7..123.56..9123.56..9123.5...9123.56.89123.56.89123.56.89123.56.89123.56789123.56.89...4.....123.56.89123.5...9123.56789123.56.89123.56789123.56.89123456789123456.89123.56.89123.56.89123.5...9123.56789123456.89123.56789123.56.89123456.89123456.89......7..123.56.89123.5...9123.56.89123456.89123.56.89123.56.89123456.89123456.89123.5..8912345.789...4..7..123.56.89123.56.89123.56.89123.56.89123.56.89123.56.89123.5..89123.5..89123.5...9123.56.89......7.....4...........7..12345..8912345..89123.5..8912345..89.....6...123.5..89123.5..89123.5..89")
         expect(pairCoversGroup(testSudoku).success).toBe(false)

         testSudoku.import("12.........3456789..3456789..3456789..3456789..3456789..3456789..345678912.........3456789123456789123456789123456789123456789123456789..3456789..3456789..3456789..3456789123456789123456789123456789123456789123456789..3456789..345678912.......12.......123456789123456789123456789123456789123456789123456789123456789..3456789..3456789123456789123456789123456789123456789123456789123456789123456789..3456789..3456789123456789123456789123456789123456789123456789123456789123456789..3456789..3456789123456789123456789123456789123456789123456789123456789123456789..3456789..3456789123456789123456789123456789123456789123456789123456789123456789..3456789..3456789123456789123456789123456789123456789123456789123456789123456789..3456789")
         expect(pairCoversGroup(testSudoku).success).toBe(false)
      })
   })

   describe('xyzWing', () => {
      test('1', () => {
         const testSudoku = new PureSudoku()
         testSudoku.import(`000050000000000709003000000100000000000400000020000000000006709000000080000006709100000000000000089000006080003000089000000700003006000000400000000050000020000000020000000000400000000006780000000089000006009000050000000000709100000000003000000003000700100000080000000009000400000020000000100006000000006780003006000000050000003000700020000000000400000000050000000006009000000080100000000003006009000006709000006000000050000100000080000000700003000000100000009000000089020000000000400000000400000000006000020000000003000009100000000003000009000050000000000700000000080000000080100000700100000700020000000000050000000400000003000000000006009000006009000000009003000000000050000000006000000000080000000700020000000000400000100000000`)
         expect(xyzWing(testSudoku).success).toBe(true)
         expect(testSudoku.data[4][8]).toStrictEqual([7, 9])
      })

      test('2', () => {
         const testSudoku = new PureSudoku()
         testSudoku.set(2, 2).to(6, 8)
         testSudoku.set(2, 3).to(3, 8, 9)
         testSudoku.set(2, 5).to(3, 6)
         expect(xyzWing(testSudoku).success).toBe(false)
      })
   })

   describe('2 string kite', () => {
      test('1', () => {
         const testSudoku = new PureSudoku()
         testSudoku.import(`000000700000006009000050000000400000003000000020000000100000000000000089000006089100000000000000080000406009000000700000006009000050000000400009003000000020000000000400009003000000020000000100000000000006009000000080000000700000050000000406009020400009020400009100000000003000000000000080000000709000006000000400709000050000000000080000000700000006009000050000000400000000006009003000000020000000100000000000050000000406009003000000020000000100000000000006709000000080000400709000400009023000000100000000000000080000000009020000700000400000000050000000006000003000700000006000000050000000400009000000080020000700003000000020400009100000000000400709023400009020400009000000700000006000000050000100000000020400009000400089003400089`)
         expect(twoStringKite(testSudoku).success).toBe(true)
         expect(testSudoku.data[7][8]).toStrictEqual([7, 9])
      })

      test('2', () => {
         const testSudoku = new PureSudoku()
         testSudoku.import(`123456780123456780123456789123456780123456780123456780123456789123456780123456780123456780123456780123456780123456789123456789123456789123456789123456789123456789123456789123456780123456780123456789123456789123456789123456789123456789123456789123456780123456789123456789123456789123456789123456789123456789123456789123456789123456780123456789123456789123456789123456789123456789123456789123456789123456789123456780123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456780123456789123456789123456789123456789123456789123456789123456789123456789123456780123456789123456789123456789123456789123456789123456789123456789123456789`)
         expect(twoStringKite(testSudoku).success).toBe(true)
         expect(testSudoku.data[6][6]).not.toContain(9)
      })

      test('double two string kite', () => {
         const testSudoku = new PureSudoku()
         testSudoku.import(`.......8....4.67.9.....67.9.2..........4.6.......5......34.67....3..6..91.........2.45.7...2.4567.9.....67.91...............8...3.........4567...2..56..9.2.4.67..1.........2.456.....3.........4.6.........7..........9.......8..2..56....2.4.6........6.....3.........4............8..2.......1................9......7......5........5.7......5.7.........8.........9..3..6......4......2.......1..........3..6...........91.........2.........3..6.......5..........7....3..6......4............8..2.4..7...2.4.67......5......34.............9.......8.1.........23..6....234.67...2.4......2.4...891.......9......7..1.34..........6.....345.....23.5..8..234.......3.........4.678.1....67......5....1..4......2..........4.67.......6.8.........9`)
         expect(twoStringKite(testSudoku).successcount).toBe(2)
      })
   })
})
