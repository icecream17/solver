import { ALL_CANDIDATES, INDICES_TO_NINE } from "../../Types";
import PureSudoku from "../Spaces/PureSudoku"
import Solver from "../Solver";
import { CellID } from "../Utils";
import { _innerWingLogic } from "./xWing";

/**
 * Same as xWing and swordfish, but with 4 lines
 */
export default function jellyfish(sudoku: PureSudoku, _solver: Solver) {
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

      // And for jellyfish, there's also:
      type ThreeLines = Readonly<{
         line1: Set<CellID>
         line2: Set<CellID>
         line3: Set<CellID>
         sumLines: Set<CellID>
      }>
      const possible3Rows = [] as ThreeLines[]
      const possible3Columns = [] as ThreeLines[]

      // For each line
      for (const index of INDICES_TO_NINE) {
         const row = candidateLocations[candidate].rows[index]
         const column = candidateLocations[candidate].columns[index]

         const check = []
         if (row.size <= 4) { // Change this!
            check.push(row)
            possibleRows.push(row) // Marker 1
         }

         if (column.size <= 4) {
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

            const possible3Lines =
               line1 === row
                  ? possible3Rows
                  : possible3Columns

            // Jellyfish part
            for (const threeLines of possible3Lines) {
               // No if statement necessary since `Marker 2` happens after this
               const sum4Lines = new Set<CellID>()
               line1.forEach(cell => sum4Lines.add(cell))
               threeLines.sumLines.forEach(cell => sum4Lines.add(cell))

               if (sum4Lines.size <= 16) {
                  successcount += _innerWingLogic(candidate, candidateLocations, sudoku, sum4Lines, line1 === row, 4)
               }
            }

            // Swordfish part
            for (const twoLines of possible2Lines) {
               // No if statement necessary since `Marker 2` happens after this
               const sum3Lines = new Set<CellID>()
               line1.forEach(cell => sum3Lines.add(cell))
               twoLines.sumLines.forEach(cell => sum3Lines.add(cell))

               if (sum3Lines.size <= 16) {
                  possible3Lines.push({
                     line1,
                     line2: twoLines.line1,
                     line3: twoLines.line2,
                     sumLines: sum3Lines,
                  })
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

               if (sumLines.size < 16) {
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
