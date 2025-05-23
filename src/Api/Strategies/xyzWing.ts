import { SudokuDigits } from "../../Types";
import PureSudoku from "../Spaces/PureSudoku";
import { affectsCell, boxAt, CellID, sharedInArrays } from "../Utils";
import { getCellsWithNCandidates, highlightCell, removeCandidateFromCells } from "../Utils.dependent";

/* TODO: When finished move to Utils */
function inSameBox(cellA: CellID, cellB: CellID) {
   return boxAt(cellA.row, cellA.column) === boxAt(cellB.row, cellB.column)
}


// /**
//  * The AC cell has A but not B
//  * The BC cell has B but not A
//  */
// function cellIsValidWing (sudoku: PureSudoku, sees: CellID, has: SudokuDigits, notHas: SudokuDigits) {
//    const cell = sudoku.data[sees.row][sees.column]
//    return cell.includes(has) && !cell.includes(notHas)
// }

export default function xyzWing (sudoku: PureSudoku) {
   // ABC  eliminations | [ABC]{2}
   // AC                |

   // Looking for ABC
   // which is in the same box as an AB
   // and also sees another two candidate cell with C (AC or BC)
   const cellsWithThreeCandidates = getCellsWithNCandidates(sudoku, 3)
   const cellsWithTwoCandidates = getCellsWithNCandidates(sudoku, 2)

   for (const basecell of cellsWithThreeCandidates) {
      // AC BC --> ABC
      // AC AB --> ABC
      const sudokubasecell = sudoku.data[basecell.row][basecell.column]

      // All cells AB sees with 2 candidates
      const affectsBaseCell = affectsCell(basecell)
      const validAffectsCell = affectsBaseCell.filter(
         sees => cellsWithTwoCandidates.includes(sees) && sudoku.data[sees.row][sees.column].every(candidate => sudokubasecell.includes(candidate))
      )
      const [valid1stWing, valid2ndWing] = validAffectsCell.reduce<[CellID[], CellID[]]>((accum, sees) => {
         if (inSameBox(sees, basecell)) {
            accum[0].push(sees)
         } else {
            accum[1].push(sees)
         }
         return accum
      }, [[], []])

      if (valid1stWing.length === 0 || valid2ndWing.length === 0) {
         continue
      }

      for (const wing1 of valid1stWing) {
         const wing1Cell = sudoku.data[wing1.row][wing1.column]
         const extraCandidate = sudokubasecell.find(candidate => !wing1Cell.includes(candidate)) as SudokuDigits

         for (const wing2 of valid2ndWing) {
            const wing2Cell = sudoku.data[wing2.row][wing2.column]
            if (wing2Cell.includes(extraCandidate) && wing2Cell.every(candidate => sudokubasecell.includes(candidate))) {
               const sharedCandidate = sudokubasecell.find(candidate =>
                  wing1Cell.includes(candidate) && wing2Cell.includes(candidate)
               ) as SudokuDigits

               const affectsAll = sharedInArrays(
                  affectsBaseCell,
                  affectsCell(wing1),
                  affectsCell(wing2)
               )

               if (removeCandidateFromCells(sudoku, sharedCandidate, affectsAll)) {
                  highlightCell(sudoku, wing1)
                  highlightCell(sudoku, wing2)
                  highlightCell(sudoku, basecell, 'orange')
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
