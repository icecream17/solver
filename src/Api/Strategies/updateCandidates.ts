import { INDICES_TO_NINE } from "../../Types"
import PureSudoku from "../Spaces/PureSudoku"
import { SuccessError } from "../Types"
import { affects, algebraic } from "../Utils"

// O(n^5)
export default function updateCandidates(sudoku: PureSudoku) {
   let updated = 0

   for (const i of INDICES_TO_NINE) {
      for (const j of INDICES_TO_NINE) {
         // Cell
         if (sudoku.data[i][j].length === 1) {

            // Cell > Candidate
            const solvedCandidate = sudoku.data[i][j][0]

            // Cell > Affects
            for (const {row, column} of affects(i, j)) {

               // Cell > Affects > Cell
               const datacell = sudoku.data[row][column]
               const tempIndex = datacell.indexOf(solvedCandidate)

               // If has candidate
               if (tempIndex !== -1) {
                  // If last candidate of that cell
                  if (datacell.length === 1) {
                     return {
                        success: false,
                        successcount: SuccessError,
                        message: `Both ${algebraic(i, j)} and ${algebraic(row, column)} must be ${solvedCandidate}`
                     }
                  }

                  updated++
                  datacell.splice(tempIndex, 1) // Deletes the candidate
                  sudoku.set(row, column).to(...datacell) // Updates/renders the cell too
               }
            }
         }
      }
   }

   if (updated > 0) {
      return {
         success: true,
         successcount: updated
      } as const
   } else {
      return {
         success: false
      } as const
   }
}
