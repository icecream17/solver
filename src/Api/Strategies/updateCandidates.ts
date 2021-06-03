import { IndexToNine } from "../../Types"
import PureSudoku from "../PureSudoku"
import Solver from "../Solver"
import { affects, algebraic } from "../Utils"

// O(n^5)
export default function updateCandidates(sudoku: PureSudoku, _solver: Solver) {
   let updated = 0

   for (let i: IndexToNine = 0; i < 9; i = i + 1 as IndexToNine) {
      for (let j: IndexToNine = 0; j < 9; j = j + 1 as IndexToNine) {
         // Cell
         if (sudoku.data[i][j].length === 1) {

            // Cell > Candidate
            const solvedCandidate = sudoku.data[i][j][0]

            // Cell > Affects
            for (const [row, column] of affects(i, j)) {

               // Cell > Affects > Cell
               const datacell = sudoku.data[row][column]
               for (let k: IndexToNine = 0; k < datacell.length; k = k + 1 as IndexToNine) {

                  // Cell > Affects > Cell > Candidate
                  if (datacell[k] === solvedCandidate) {
                     if (datacell.length === 1) {
                        return {
                           success: true,
                           successcount: -1,
                           message: `Both ${algebraic(i, j)} and ${algebraic(row, column)} must be ${solvedCandidate}`
                        }
                     }

                     updated++
                     datacell.splice(k, 1) // Deletes the candidate
                     sudoku.set(row, column).to(...datacell) // Updates/renders the cell too

                     // Now that the candidate is deleted,
                     // the index already corresponds to the next candidate.
                     // Since the for-loop automatically increments k, we decrement k
                     //
                     // But if the candidate index is the last index,
                     // the for loop still keeps going since the condition is
                     // checked before the increment, and k-1 < k (=== datacell.length)
                     //
                     // That's why there's an if statement checking if k === datacell.length
                     if (k === datacell.length) {
                        break;
                     }
                     k = k - 1 as IndexToNine
                  }
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
