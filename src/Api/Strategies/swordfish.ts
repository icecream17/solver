import { ALL_CANDIDATES, INDICES_TO_NINE } from "../../Types";
import PureSudoku from "../PureSudoku"
import Solver from "../Solver";
import { CellID } from "../Utils";
import { _innerWingLogic } from "./xWing";

/**
 * Same as xWing, but with 3 lines
 */
export default function swordfish(sudoku: PureSudoku, _solver: Solver) {
   let successcount = 0

   const candidateLocations = sudoku.getCandidateLocations()
   for (const candidate of ALL_CANDIDATES) {
      const possibleRows = [] as Set<CellID>[]
      const possibleColumns = [] as Set<CellID>[]

      // Unlike xWing, we also have:
      type TwoLines = Readonly<{
         line1: Set<CellID>
         line2: Set<CellID>
         sumLines: Set<CellID>
      }>
      const possible2Rows = [] as TwoLines[]
      const possible2Columns = [] as TwoLines[]

      for (const index of INDICES_TO_NINE) {
         const row = candidateLocations[candidate].rows[index]
         const column = candidateLocations[candidate].columns[index]

         const check = []
         if (row.size <= 3) { // Change this!
            check.push(row)
            possibleRows.push(row) // Marker 1
         }

         if (column.size <= 3) {
            check.push(column)
            possibleColumns.push(column) // Marker 1
         }

         for (const line1 of check) {
            const possibleLines =
               line1 === row
                  ? possibleRows
                  : possibleColumns

            const possible2Lines =
               line1 === row
                  ? possible2Rows
                  : possible2Columns

            // Swordfish part
            for (const twoLines of possible2Lines) {
               // No if statement necessary since `Marker 2` happens after this
               const sum3Lines = new Set<CellID>()
               line1.forEach(cell => sum3Lines.add(cell))
               twoLines.sumLines.forEach(cell => sum3Lines.add(cell))

               if (sum3Lines.size <= 9) {
                  successcount += _innerWingLogic(candidate, candidateLocations, sudoku, sum3Lines, line1 === row, 3)
               }
            }


            // Marker 2
            // Part for adding to possible2Lines (goes after swordfish)
            for (const line2 of possibleLines) {
               // Necessary because `Marker 1` happens before this
               if (line1 === line2) {
                  continue
               }

               const sumLines = new Set<CellID>()
               line1.forEach(cell => sumLines.add(cell))
               line2.forEach(cell => sumLines.add(cell))

               if (sumLines.size < 10) {
                  possible2Lines.push({
                     line1,
                     line2,
                     sumLines,
                  })
               }
            }
         }
      }
   }

   if (successcount === 0) {
      return {
         success: false
      } as const
   }

   return {
      success: true,
      successcount
   } as const
}
