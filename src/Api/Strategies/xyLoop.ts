import { SudokuDigits } from "../../Types";
import PureSudoku from "../Spaces/PureSudoku";
import { affects, algebraic, assertGet, CandidateID, CellID, id, removeFromArray, sharedInSets } from "../Utils";
import { colorCandidate, getCellsWithNCandidates } from "../Utils.dependent";

/**
 * next = has
 *
 * See {@link findLoop}
 */
export function cellIsValidLoop (sudoku: PureSudoku, sees: CellID, has: SudokuDigits, loop: CellID[]) {
   const cell = sudoku.data[sees.row][sees.column]
   return cell.includes(has) && !loop.includes(sees)
}

function seenByColor (sudoku: PureSudoku, color: CandidateID[]) {
   const seen = new Set<CandidateID>()
   for (const { row, column, digit } of color) {
      for (const cell of affects(row, column)) {
         if (sudoku.data[cell.row][cell.column].includes(digit)) {
            seen.add(id(cell.row, cell.column, digit))
         }
      }
   }

   return seen
}

/**
 * Checks if a loop actually eliminates anything
 *
 * @param endsConnect If ends don't connect, only eliminate from the ends
 */
function checkLoop (sudoku: PureSudoku, color1: CandidateID[], color2: CandidateID[]) {
   const seenByColor1 = seenByColor(sudoku, color1)
   const seenByColor2 = seenByColor(sudoku, color2)
   const seenByBoth = sharedInSets(seenByColor1, seenByColor2)

   if (seenByBoth.size > 0) {
      for (const candidate of color1) {
         colorCandidate(sudoku, candidate)
      }
      for (const candidate of color2) {
         colorCandidate(sudoku, candidate, "green")
      }
      for (const { row, column, digit } of seenByBoth) {
         sudoku.remove(digit).at(row, column)
      }

      return {
         success: true,
         successcount: 1,
         message: `${color2.map(cand => algebraic(cand.row, cand.column)).join("<>")}<>`,
      } as const
   }

   return false
}

/**
 * Looking for a loop of cells
 *
 * AB, BC, CD, DE, EF, ... and so on, until you reach the end ZA,
 * which loops back to AB
 *
 * In an xyLoop you can be certain that the loop will either be:
 *
 * ABCDEF...Z
 * or
 * BCDEF....A
 */
export default function xyLoop (sudoku: PureSudoku) {
   /**
    * The most important util
    *
    * @param cell The cell just added to the loop
    * @param start The first cell in the loop
    * @param next The next cell in the loop needs to have *this* candidate
    * @param end The last cell in the loop needs to have *this* candidate
    * @param color1 Used for coloring the candidate for display
    * @param color2 Used for coloring the candidate for display
    * @param loop The current built up loop
    * @returns false if failed, CellID[] is loop was found
    */
   function findLoop (
      cell: CellID,
      start: CellID,
      next: SudokuDigits,
      end: SudokuDigits,
      color1: CandidateID[],
      color2: CandidateID[],
      loop: CellID[] = [cell]
   ): ReturnType<typeof checkLoop> | false {
      // All cells AB sees with 2 candidates
      const validAffectsCell = __getFellowCWTC(cell).filter(fellow => cellIsValidLoop(sudoku, fellow, next, loop))

      for (const possibleNext of validAffectsCell) {
         const nextNext = sudoku.data[possibleNext.row][possibleNext.column].find(
            candidate => candidate !== next) as SudokuDigits

         loop.push(possibleNext)

         // No parity check needed, AB BC CD --> ABC BCD
         color2.push(id(possibleNext.row, possibleNext.column, next))
         color1.push(id(possibleNext.row, possibleNext.column, nextNext))

         const endsConnect = affects(start.row, start.column).includes(possibleNext)
         if (nextNext === end && endsConnect) {
            const isLoopResult = checkLoop(sudoku, color1, color2)

            if (isLoopResult) {
               return isLoopResult
            }
         }

         const result = findLoop(possibleNext, start, nextNext, end, color1, color2, loop)
         if (result) {
            return result
         }

         loop.pop()
         color1.pop()
         color2.pop()
      }

      return false // Fail
   }

   const __getFellowCWTC = (cell: CellID) =>
      assertGet(affectsCWTC, cell).filter(sees => cellsWithTwoCandidates.includes(sees))


   const cellsWithTwoCandidates = getCellsWithNCandidates(sudoku, 2)

   // CWTC acronym for cellsWithTwoCandidates
   const affectsCWTC = new Map(
      cellsWithTwoCandidates.map(cell => [cell, affects(cell.row, cell.column)])
   )

   for (const cell of cellsWithTwoCandidates) {
      const [candA, candB] = sudoku.data[cell.row][cell.column]

      // Candidate coloring
      const color1 = [id(cell.row, cell.column, candA)] as CandidateID[]
      const color2 = [id(cell.row, cell.column, candB)] as CandidateID[]

      // Start with candA
      // With a recursive function, add to the list until it fails or succeeds
      const result = findLoop(cell, cell, candA, candB, color1, color2)
      if (result) {
         return result
      }

      // Failed, so that cell must not be in any loop, it can be removed
      removeFromArray(cell, cellsWithTwoCandidates)
   }

   return {
      success: false
   } as const
}
