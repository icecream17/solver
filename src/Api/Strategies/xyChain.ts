import { SudokuDigits } from "../../Types";
import PureSudoku from "../Spaces/PureSudoku";
import { affects, assertGet, CandidateID, CellID, id, sharedInSets } from "../Utils";
import { getCellsWithTwoCandidates } from "../Utils.dependent";
import { highlightCell, colorCandidate, cellIsValidLoop } from "./xyLoop";


/**
 * Looking for a chain of cells
 * The code used is extremely similar to xyLoop
 *
 * However, the loop doesn't have to be completed.
 * There's still the restriction that the first and last cells of the chain must share a candidate
 *
 * The logic in this case is either:
 * first cell = candidate ---> not last cell
 * last cell = candidate ---> not first cell
 *
 * Basically no matter what, one of the ends has candidate.
 */
export default function xyChain (sudoku: PureSudoku) {
   function seenByEnd ({ row, column, digit }: CandidateID) {
      const seen = new Set<CandidateID>()
      for (const cell of affects(row, column)) {
         if (sudoku.data[cell.row][cell.column].includes(digit)) {
            seen.add(id(cell.row, cell.column, digit))
         }
      }

      return seen
   }

   /**
    * Checks if a loop actually eliminates anything
    *
    * @param endsConnect If ends don't connect, only eliminate from the ends
    */
   function checkLoop (color1: CandidateID[], color2: CandidateID[]) {
      const start = color1[color1.length - 1] // TODO: Change when chromebook updates
      const end = color2[0]
      const seenByColor1 = seenByEnd(start)
      const seenByColor2 = seenByEnd(end)
      const seenByBoth = sharedInSets(seenByColor1, seenByColor2)

      if (seenByBoth.size > 0) {
         highlightCell(sudoku, id(start.row, start.column), "orange")
         highlightCell(sudoku, id(end.row, end.column), "orange")

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
            successcount: 1
         } as const
      }

      return false
   }

   /**
    * The most important util
    * Extremely similar to "findLoop" in xyLoop
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

         if (nextNext === end) {
            // Don't care if ends connect
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


   const cellsWithTwoCandidates = getCellsWithTwoCandidates(sudoku)

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
   }

   return {
      success: false
   } as const
}
