import { SudokuDigits } from "../../Types";
import PureSudoku from "../Spaces/PureSudoku";
import Sudoku from "../Spaces/Sudoku";
import { affects, assertGet, CandidateID, CellID, id, removeFromArray, sharedInSets } from "../Utils";
import { getCellsWithNCandidates } from "../Utils.dependent";

/**
 * next = has
 *
 * See {@link findLoop}
 */
export function cellIsValidLoop (sudoku: PureSudoku, sees: CellID, has: SudokuDigits, loop: CellID[]) {
   const cell = sudoku.data[sees.row][sees.column]
   return cell.includes(has) && !loop.includes(sees)
}

/**
 * Same as {@link colorGroup}, but this time with a specific candidate
 */
export function colorCandidate (sudoku: PureSudoku, {row, column, digit}: CandidateID, color = 'blue') {
   if (sudoku instanceof Sudoku) {
      const element = sudoku.cells[row][column]
      element?.highlight([digit], color)
   }
}

/**
 * Colors a group of cells', see {@link Cell#highlight}
 */
export function highlightCell (sudoku: PureSudoku, cell: CellID, color = 'blue') {
   if (sudoku instanceof Sudoku) {
      const element = sudoku.cells[cell.row][cell.column]
      element?.addClass(color)
   }
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
   function seenByColor(color: CandidateID[]) {
      const seen = new Set<CandidateID>()
      for (const {row, column, digit} of color) {
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
   function checkLoop(color1: CandidateID[], color2: CandidateID[]) {
      const seenByColor1 = seenByColor(color1)
      const seenByColor2 = seenByColor(color2)
      const seenByBoth = sharedInSets(seenByColor1, seenByColor2)

      if (seenByBoth.size > 0) {
         for (const candidate of color1) {
            colorCandidate(sudoku, candidate)
         }
         for (const candidate of color2) {
            colorCandidate(sudoku, candidate, "green")
         }
         for (const {row, column, digit} of seenByBoth) {
            sudoku.remove(digit).at(row, column)
         }

         return {
            success: true,
            successcount: 1
         } as const
      }

      return false
   }

   /**
    * The most important util
    *
    * @param loop The current built up loop
    * @param color1 Used for coloring the candidate for display
    * @param color2 Used for coloring the candidate for display
    * @param next The next cell in the loop needs to have *this* candidate
    * @param end The last cell in the loop needs to have *this* candidate
    * @returns false if failed, CellID[] is loop was found
    */
   function findLoop (cell: CellID, start: CellID, next: SudokuDigits, end: SudokuDigits, color1: CandidateID[], color2: CandidateID[], loop: CellID[] = [cell]): ReturnType<typeof checkLoop> | false {
      // All cells AB sees with 2 candidates
      const validAffectsCell = __getFellowCWTC(cell).filter(fellow => cellIsValidLoop(sudoku, fellow, next, loop))

      for (const possibleNext of validAffectsCell) {
         const nextNext = sudoku.data[possibleNext.row][possibleNext.column].find(
            candidate => candidate !== next) as SudokuDigits
         const nextNextId = id(possibleNext.row, possibleNext.column, nextNext)

         loop.push(possibleNext)

         // No parity check needed, AB BC CD --> ABC BCD
         color2.push(id(possibleNext.row, possibleNext.column, next))
         color1.push(nextNextId)

         const endsConnect = affects(start.row, start.column).includes(possibleNext)
         if (nextNext === end && endsConnect) {
            const isLoopResult = checkLoop(color1, color2)

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
