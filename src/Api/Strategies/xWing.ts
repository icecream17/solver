import { ALL_CANDIDATES, IndexToNine, INDICES_TO_NINE } from "../../Types";
import PureSudoku from "../PureSudoku"
import Solver from "../Solver";
import { CellID } from "../Utils";
import { colorGroup } from "./intersectionRemoval";

/**
 * 2 candidates in 2 rows, which align on 2 columns
 *
 * or
 *
 * 2 candidates in 2 columns, which align on 2 rows
 */
export default function xWing (sudoku: PureSudoku, _solver: Solver) {
   let successcount = 0

   const candidateLocations = sudoku.getCandidateLocations()
   for (const candidate of ALL_CANDIDATES) {
      const possibleRows = [] as Set<CellID>[]
      const possibleColumns = [] as Set<CellID>[]
      for (const index of INDICES_TO_NINE) {
         const row = candidateLocations[candidate].rows[index]
         const column = candidateLocations[candidate].columns[index]

         const check = []
         if (row.size < 3) {
            check.push(row)
            possibleRows.push(row) // Marker 1
         }

         if (column.size < 3) {
            check.push(column)
            possibleColumns.push(column) // Marker 1
         }

         // line = row/column
         // pendLine = column/row
         for (const line1 of check) {
            const possibleLines =
               line1 === row
                  ? possibleRows
                  : possibleColumns

            for (const line2 of possibleLines) {
               // Necessary because `Marker 1` happens before this
               if (line1 === line2) {
                  continue
               }

               const sumLines = new Set<CellID>()
               line1.forEach(cell => sumLines.add(cell))
               line2.forEach(cell => sumLines.add(cell))

               if (sumLines.size < 5) {
                  const patternRows = new Set<IndexToNine>()
                  const patternColumns = new Set<IndexToNine>()
                  for (const cell of sumLines) {
                     patternRows.add(cell.row)
                     patternColumns.add(cell.column)
                  }

                  const { patternLines, patternPendLines } =
                     line1 === row
                        ? { patternLines: patternRows, patternPendLines: patternColumns }
                        : { patternLines: patternColumns, patternPendLines: patternRows }

                  const { lineProp, pendLineProp } =
                     line1 === row
                        ? { lineProp: "row", pendLineProp: "columns" } as const
                        : { lineProp: "column", pendLineProp: "rows" } as const

                  if (patternPendLines.size < 3) {
                     // Pattern finally identified!
                     let success = false

                     for (const eliminationPendLine of patternPendLines) {
                        for (const cell of candidateLocations[candidate][pendLineProp][eliminationPendLine]) {
                           if (patternLines.has(cell[lineProp]) === false) {
                              sudoku.toggle(candidate).at(cell.row, cell.column)
                              colorGroup(sudoku, sumLines, candidate)
                              success = true
                           }
                        }
                     }

                     if (success) {
                        successcount++
                     }
                  }
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
