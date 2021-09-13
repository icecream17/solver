import { SudokuDigits } from "../../Types";
import PureSudoku from "../Spaces/PureSudoku";
import { affects, assertGet, CellID, sharedInArrays } from "../Utils";
import { getCellsWithTwoCandidates, colorGroup } from "../Utils.dependent";

/**
 * The AC cell has A but not B
 * The BC cell has B but not A
 */
function cellIsValidWing(sudoku: PureSudoku, sees: CellID, has: SudokuDigits, notHas: SudokuDigits) {
   const cell = sudoku.data[sees.row][sees.column]
   return cell.includes(has) && !cell.includes(notHas)
}

export default function yWing (sudoku: PureSudoku) {
   // AB   BC
   // AC

   // Looking for a cell AB
   // Where A sees another A in AC
   // Where B sees another B in BC

   const cellsWithTwoCandidates = getCellsWithTwoCandidates(sudoku)

   // CWTC acronym for cellsWithTwoCandidates
   const affectsCWTC = new Map(
      cellsWithTwoCandidates.map(cell => [cell, affects(cell.row, cell.column)])
   )

   for (const cell of cellsWithTwoCandidates) {
      const [ candA, candB ] = sudoku.data[cell.row][cell.column]

      // All cells AB sees with 2 candidates
      const validAffectsCell = assertGet(affectsCWTC, cell).filter(sees => cellsWithTwoCandidates.includes(sees))

      const possibleAC = validAffectsCell.filter(sees => cellIsValidWing(sudoku, sees, candA, candB))
      const possibleBC = validAffectsCell.filter(sees => cellIsValidWing(sudoku, sees, candB, candA))

      for (const AC of possibleAC) {
         for (const BC of possibleBC) {
            if (AC === BC) {
               continue;
            }

            const cellAC = sudoku.data[AC.row][AC.column]
            const cellBC = sudoku.data[BC.row][BC.column]
            const candC = cellAC.find(candidate => candidate !== candA) as SudokuDigits

            if (cellBC.includes(candC)) {
               // Found a strong link with C in AC and BC!
               const sharedEffects = sharedInArrays(
                  assertGet(affectsCWTC, AC), assertGet(affectsCWTC, BC)
               )

               if (sharedEffects.size > 0) {
                  let success = false
                  for (const cell of sharedEffects) {
                     if (sudoku.data[cell.row][cell.column].includes(candC)) {
                        sudoku.remove(candC).at(cell.row, cell.column)
                        success = true
                     }
                  }

                  if (success) {
                     colorGroup(sudoku, [cell, AC], candA)
                     colorGroup(sudoku, [cell, BC], candB, "green")
                     colorGroup(sudoku, [AC, BC], candC, "orange")
                     return {
                        success: true,
                        successcount: 1
                     } as const
                  }
               }
            }
         }
      }
   }

   return {
      success: false
   } as const
}
