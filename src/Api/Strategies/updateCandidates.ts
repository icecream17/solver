import { INDICES_TO_NINE } from "../../Types"
import PureSudoku from "../Spaces/PureSudoku"
import { SuccessError } from "../Types"
import { affects, algebraic, CellID } from "../Utils"

// O(n^5)
export default function updateCandidates(sudoku: PureSudoku) {
   let updated = 0
   const newResults = new Set<CellID>()

   for (const i of INDICES_TO_NINE) {
      for (const j of INDICES_TO_NINE) {
         // Cell
         if (sudoku.data[i][j].length === 1) {

            // Cell > Candidate
            const solvedCandidate = sudoku.data[i][j][0]

            // Cell > Affects
            for (const id of affects(i, j)) {

               // Cell > Affects > Cell
               const datacell = sudoku.data[id.row][id.column]
               const tempIndex = datacell.indexOf(solvedCandidate)

               // If has candidate
               if (tempIndex !== -1) {
                  // If last candidate of that cell
                  if (datacell.length === 1) {
                     return {
                        success: false,
                        successcount: SuccessError,
                        message: `Both ${algebraic(i, j)} and ${algebraic(id.row, id.column)} must be ${solvedCandidate}`
                     }
                  }

                  datacell.splice(tempIndex, 1) // Deletes the candidate
                  newResults.add(id)
                  updated++
               }
            }
         }
      }
   }

   if (updated > 0) {
      for (const {row, column} of newResults) {
         sudoku.set(row, column).to(...sudoku.data[row][column]) // Don't run Cell#setState on every single candidate removal
      }

      return {
         success: true,
         successcount: updated
      } as const
   }

   return {
      success: false
   } as const
}
