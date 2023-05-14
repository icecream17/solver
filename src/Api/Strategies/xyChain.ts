import { SudokuDigits } from "../../Types";
import PureSudoku from "../Spaces/PureSudoku";
import { affects, algebraic, assertGet, CandidateID, CellID, id, sharedInSets } from "../Utils";
import { colorCandidate, getCellsWithNCandidates, highlightCell } from "../Utils.dependent";
import { cellIsValidLoop } from "./xyLoop";

// Very similar to seenByColor in xyLoop
function seenByEnd (sudoku: PureSudoku, { row, column, digit }: CandidateID) {
   const seen = new Set<CandidateID>()
   for (const cell of affects(row, column)) {
      if (sudoku.data[cell.row][cell.column].includes(digit)) {
         seen.add(id(cell.row, cell.column, digit))
      }
   }

   return seen
}

/**
 * Checks if a loop (or here, a chain) actually eliminates anything
 */
function checkLoop (sudoku: PureSudoku, color1: CandidateID[], color2: CandidateID[]) {
   const color1End = color1[color1.length - 1]
   const color2End = color2[0]
   const seenByColor1 = seenByEnd(sudoku, color1End)
   const seenByColor2 = seenByEnd(sudoku, color2End)
   const seenByBoth = sharedInSets(seenByColor1, seenByColor2)

   if (seenByBoth.size > 0) {
      highlightCell(sudoku, id(color1End.row, color1End.column), "orange")
      highlightCell(sudoku, id(color2End.row, color2End.column), "orange")

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
         message: `${color2End.digit} ${color2.map(cand => algebraic(cand.row, cand.column)).join("<>")} ${color1End.digit}`,
      } as const
   }

   return false
}

/**
 * Looking for a chain of cells
 * The code used is extremely similar to xyLoop
 *
 * However, the loop doesn't have to be completed.
 * There's still the restriction that the first and last cells of the chain must share a candidate
 *
 * The logic in this case is either:
 * first cell = candidate --> not last cell
 * last cell = candidate --> not first cell
 *
 * Basically no matter what, one of the ends has the candidate.
 */
export default function xyChain(sudoku: PureSudoku) {
   /**
    * The most important util
    * Extremely similar to "findLoop" in xyLoop
    *
    * @param cell The cell just added to the loop
    * @param next The next cell in the loop needs to have *this* candidate
    * @param end The last cell in the loop needs to have *this* candidate
    * @param color1 Used for coloring the candidate for display
    * @param color2 Used for coloring the candidate for display
    * @param loop The current built up loop
    * @returns false if failed, CellID[] is loop was found
    */
   function findLoop(cell: CellID, next: SudokuDigits, end: SudokuDigits, color1: CandidateID[], color2: CandidateID[], loop: CellID[] = [cell]): ReturnType<typeof checkLoop> | false {
      // All cells AB sees with 2 candidates
      const validAffectsCell = __getFellowCWTC(cell).filter(fellow => cellIsValidLoop(sudoku, fellow, next, loop))

      for (const possibleNext of validAffectsCell) {
         const nextNext = sudoku.data[possibleNext.row][possibleNext.column].find(
            candidate => candidate !== next) as SudokuDigits

         loop.push(possibleNext)

         // No parity check needed, AB BC CD --> ABC BCD
         color2.push(id(possibleNext.row, possibleNext.column, next))
         color1.push(id(possibleNext.row, possibleNext.column, nextNext))

         if (nextNext === end) {
            // Don't care if ends connect
            const isLoopResult = checkLoop(sudoku, color1, color2)

            if (isLoopResult) {
               return isLoopResult
            }
         }

         const result = findLoop(possibleNext, nextNext, end, color1, color2, loop)
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
      const resultA = findLoop(cell, candA, candB, color1, color2)
      if (resultA) {
         return resultA
      }

      const resultB = findLoop(cell, candB, candA, color2, color1)
      if (resultB) {
         return resultB
      }
   }

   return {
      success: false
   } as const
}
