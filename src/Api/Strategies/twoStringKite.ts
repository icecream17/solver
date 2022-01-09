import { ALL_CANDIDATES, SudokuDigits } from "../../Types";
import PureSudoku from "../Spaces/PureSudoku";
import { CellID } from "../Utils";
import { colorCandidateF } from "../Utils.dependent";

type CandidateInfo = ReturnType<typeof PureSudoku.prototype.getCandidateLocations>[SudokuDigits]

/**
 * Checks if two cells create a two string kite
 * Maybe these checkers could be symbolized as matchers
 */
function check(cell1: CellID, cell2: CellID, candidate: SudokuDigits, candLocations: CandidateInfo, sudoku: PureSudoku) {
   /* eslint-disable sonarjs/no-collapsible-if -- It's clearer */
   if (cell1.row === cell2.row || cell1.column === cell2.column) {
      return 0
   }

   const sameRowAsCell1 = candLocations.rows[cell1.row]
   const sameColAsCell2 = candLocations.columns[cell2.column]
   if (sameRowAsCell1.size === 2 && sameColAsCell2.size === 2) {
      // Looks big nesting but not really
      for (const cell1B of sameRowAsCell1) {
         if (cell1B !== cell1) {
            for (const cell2B of sameColAsCell2) {
               if (cell2B !== cell2) {
                  // All this does is get 1b and 2b
                  //    1   1b
                  // 2
                  // 2b
                  if (sudoku.data[cell2B.row][cell1B.column].includes(candidate)) {
                     colorCandidateF(sudoku, cell1.row, cell1.column, candidate)
                     colorCandidateF(sudoku, cell2.row, cell2.column, candidate, 'green')
                     colorCandidateF(sudoku, cell1B.row, cell1B.column, candidate)
                     colorCandidateF(sudoku, cell2B.row, cell2B.column, candidate, 'green')
                     sudoku.remove(candidate).at(cell2B.row, cell1B.column)
                     return 1
                  }
               }
            }
         }
      }
   }

   return 0
}

export default function twoStringKite(sudoku: PureSudoku) {
   const candidateLocations = sudoku.getCandidateLocations()

   for (const candidate of ALL_CANDIDATES) {
      for (const box of candidateLocations[candidate].boxes) {
         if (box.size === 2) {
            const [cell1, cell2] = box
            const successcount =
               check(cell1, cell2, candidate, candidateLocations[candidate], sudoku) +
               check(cell2, cell1, candidate, candidateLocations[candidate], sudoku)
            if (successcount) {
               return {
                  success: true,
                  successcount
               } as const
            }
         }
      }
   }

   return { success: false } as const
}
