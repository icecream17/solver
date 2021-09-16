import { SudokuDigits } from "../../Types";
import PureSudoku from "../Spaces/PureSudoku";
import { affects, assertGet, boxAt, CellID, sharedInArrays } from "../Utils";
import { getCellsWithNCandidates } from "../Utils.dependent";

/* TODO: When finished move to Utils */
function inSameBox(cellA: CellID, cellB: CellID) {
   return boxAt(cellA.row, cellA.column) === boxAt(cellB.row, cellB.column)
}


/**
 * The AC cell has A but not B
 * The BC cell has B but not A
 */
function cellIsValidWing (sudoku: PureSudoku, sees: CellID, has: SudokuDigits, notHas: SudokuDigits) {
   const cell = sudoku.data[sees.row][sees.column]
   return cell.includes(has) && !cell.includes(notHas)
}

export default function xyzWing (sudoku: PureSudoku) {
   // ABC  eliminations | [ABC]{2}
   // AC                |

   // Looking for ABC
   // which is in the same box as an AB
   // and also sees another two candidate cell
   // If BC, B
   // If AC, A
   // If AB, Nothing...
   const cellsWithThreeCandidates = getCellsWithNCandidates(sudoku, 3)
   const cellsWithTwoCandidates = getCellsWithNCandidates(sudoku, 2)

   // CW3C acronym for cellsWithTwoCandidates
   const affectsCW3C = new Map(
      cellsWithThreeCandidates.map(cell => [cell, affects(cell.row, cell.column)])
   )
   const affectsCW2C = new Map(
      cellsWithTwoCandidates.map(cell => [cell, affects(cell.row, cell.column)])
   )

   for (const basecell of cellsWithThreeCandidates) {
      // AC BC --> ABC
      // AC AB --> ABC
      const sudokubasecell = sudoku.data[basecell.row][basecell.column]

      // All cells AB sees with 2 candidates
      const affectsBaseCell = assertGet(affectsCW3C, basecell)
      const validAffectsCell = affectsBaseCell.filter(
         sees => cellsWithTwoCandidates.includes(sees) && sharedInArrays(sudokubasecell, sudoku.data[sees.row][sees.column])
      )
      const valid1stWing = validAffectsCell.filter(sees => inSameBox(sees, basecell))

      for (const wing1 of valid1stWing) {
         const wing1Cell = sudoku.data[wing1.row][wing1.column]
         const extraCandidate = sudokubasecell.find(candidate => wing1Cell.includes(candidate)) as SudokuDigits

         for (const wing2 of validAffectsCell) {
            const wing2Cell = sudoku.data[wing2.row][wing2.column]
            if (wing2Cell.includes(extraCandidate)) {
               const affectsAll = sharedInArrays(
                  affectsBaseCell,
                  assertGet(affectsCW2C, wing1),
                  assertGet(affectsCW2C, wing2)
               )


               let success = false
               for (const cell of affectsAll) {
                  if (sudoku.data[cell.row][cell.column].includes(extraCandidate)) {
                     sudoku.remove(extraCandidate).at(cell.row, cell.column)
                     success = true
                  }
               }

               if (success) {
                  return {
                     success: true,
                     successcount: 1
                  } as const
               }
            }
         }
      }
   }

   return {
      success: false
   } as const
}
