import { SudokuDigits } from "../../Types";
import Solver from "../Solver";
import PureSudoku from "../Spaces/PureSudoku";
import { affects, assertGet, CellID, getCellsWithTwoCandidates } from "../Utils";

/**
 * The AC cell has A but not B
 * The BC cell has B but not A
 */
function cellIsValidWing (sudoku: PureSudoku, sees: CellID, has: SudokuDigits, notHas: SudokuDigits) {
   const cell = sudoku.data[sees.row][sees.column]
   return cell.includes(has) && !cell.includes(notHas)
}

export default function xyzWing (sudoku: PureSudoku, _solver: Solver) {
   // ABC  ec | BC
   // AC      |

   // Looking for AC and BC
   // which are connected by ABC

   const cellsWithTwoCandidates = getCellsWithTwoCandidates(sudoku)

   // CWTC acronym for cellsWithTwoCandidates
   const affectsCWTC = new Map(
      cellsWithTwoCandidates.map(cell => [cell, affects(cell.row, cell.column)])
   )

   for (const cell of cellsWithTwoCandidates) {
      // AC BC --> ABC
      // AC AB --> ABC
      const [candA, candC] = sudoku.data[cell.row][cell.column]

      // All cells AB sees with 2 candidates
      const validAffectsCell = assertGet(affectsCWTC, cell).filter(sees => cellsWithTwoCandidates.includes(sees))

      const possibleAB = validAffectsCell.filter(sees => cellIsValidWing(sudoku, sees, candA, candC))
      const possibleBC = validAffectsCell.filter(sees => cellIsValidWing(sudoku, sees, candC, candA))

   }

   return {
      success: false
   } as const
}
