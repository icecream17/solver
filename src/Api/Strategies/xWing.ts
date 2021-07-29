import { ALL_CANDIDATES, IndexToNine, INDICES_TO_NINE } from "../../Types";
import PureSudoku from "../PureSudoku"
import Solver from "../Solver";
import { CellID } from "../Utils";

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

         if (row.size < 3) {
            for (const otherRow of possibleRows) {
               const rowTotal = new Set<CellID>()
               row.forEach(cell => rowTotal.add(cell))
               otherRow.forEach(cell => rowTotal.add(cell))

               if (rowTotal.size < 5) {
                  const patternRows = new Set<IndexToNine>()
                  const patternColumns = new Set<IndexToNine>()
                  for (const cell of rowTotal) {
                     patternRows.add(cell.row)
                     patternColumns.add(cell.column)
                  }

                  if (patternColumns.size < 3) {
                     // Pattern finally identified!
                     let success = false
                     for (const eliminationColumn of patternColumns) {
                        for (const cell of candidateLocations[candidate].columns[eliminationColumn]) {
                           if (patternRows.has(cell.row) === false) {
                              sudoku.toggle(candidate).at(cell.row, cell.column)
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

            possibleRows.push(row)
         }

         // See the `row.size` if statement
         if (column.size < 3) {
            for (const otherColumn of possibleColumns) {
               const columnTotal = new Set<CellID>()
               column.forEach(cell => columnTotal.add(cell))
               otherColumn.forEach(cell => columnTotal.add(cell))

               if (columnTotal.size < 5) {
                  const patternRows = new Set<IndexToNine>()
                  const patternColumns = new Set<IndexToNine>()
                  for (const cell of columnTotal) {
                     patternRows.add(cell.row)
                     patternColumns.add(cell.column)
                  }

                  if (patternColumns.size < 3) {
                     // Pattern finally identified!
                     let success = false
                     for (const eliminationRow of patternRows) {
                        for (const cell of candidateLocations[candidate].rows[eliminationRow]) {
                           if (patternColumns.has(cell.column) === false) {
                              sudoku.toggle(candidate).at(cell.row, cell.column)
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

            possibleColumns.push(column)
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
