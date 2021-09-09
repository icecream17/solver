import { ALL_CANDIDATES, IndexToNine, INDICES_TO_NINE, SudokuDigits } from "../../Types";
import Solver from "../Solver";
import PureSudoku from "../Spaces/PureSudoku";
import { affects, CellID, sharedInArrays } from "../Utils";
import { colorGroup } from "./intersectionRemoval";
import { __incrementMapValue } from "./skyscraper";

export function _innerGroupSubtractionLogic(
   candidate: SudokuDigits,
   sudoku: PureSudoku,
   sumLines: Set<CellID>,
   isRow: boolean,
   wingSize: number
) {
   const patternRows = new Map<IndexToNine, number>()
   const patternColumns = new Map<IndexToNine, number>()
   for (const cell of sumLines) {
      __incrementMapValue(patternRows, cell.row)
      __incrementMapValue(patternColumns, cell.column)
   }

   // How many line see a candidate
   const patternPendLineElims = new Map<CellID, number>()
   const patternPendLines = isRow ? patternColumns : patternRows
   const pendLineProp = isRow ? "column" : "row"

   /**
    * A  B  C | D
    *       ! |
    *       ! |
    * --------+--
    *       C | D
    *
    * A  B  C | D   | D
    * A  B  C | D   | D
    * ab ab ! |     |
    * --------+-----+---
    * a  b  C | D   | D
    * Take each column and ask what they collectively see
    * Anything seen by > total - wingSize columns can be eliminated
    */
   for (const [eliminationPendLine] of patternPendLines) {
      const inLine = [] as CellID[][]
      for (const cell of sumLines) {
         if (cell[pendLineProp] === eliminationPendLine) {
            inLine.push(affects(cell.row, cell.column))
         }
      }

      // shared = all extra see
      const shared = sharedInArrays(...inLine)
      for (const cell of shared) {
         const complexCondition =
            sudoku.data[cell.row][cell.column].includes(candidate) &&
            !sumLines.has(cell)

         if (complexCondition) {
            __incrementMapValue(patternPendLineElims, cell)
         }
      }
   }

   let successcount = 0
   for (const [cell, count] of patternPendLineElims) {
      if (patternPendLines.size - count < wingSize) {
         successcount++
         sudoku.remove(candidate).at(cell.row, cell.column)
         // NOTE: Highlighting is currently done in the main function
      }
   }

   if (successcount) {
      console.debug({patternRows, patternColumns, patternPendLineElims})
      return {
         success: true,
         successcount
      }
   }


   return null
}

/**
 * Disjointed x wing - see Strategies.md
 *
 * Two lines - 1 cross line = extra
 * If all extra see n, n is eliminated (since extra must have at least 1)
 */
export default function twoMinusOneLines(sudoku: PureSudoku, _solver: Solver) {
   const candidateLocations = sudoku.getCandidateLocations()
   for (const candidate of ALL_CANDIDATES) {
      const possibleRows = [] as Set<CellID>[]
      const possibleColumns = [] as Set<CellID>[]
      for (const index of INDICES_TO_NINE) {
         const row = candidateLocations[candidate].rows[index]
         const column = candidateLocations[candidate].columns[index]

         const check = []
         if (row.size < 2 + 4) { // 4 candidates of a row cannot share anything affects other than the row
            check.push(row)
            possibleRows.push(row) // Marker 1
         }

         if (column.size < 2 + 4) {
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

               const result = _innerGroupSubtractionLogic(candidate, sudoku, sumLines, line1 === row, 2)
               if (result !== null) {
                  colorGroup(sudoku, sumLines, candidate)
                  return result
               }
            }
         }
      }
   }

   return {
      success: false
   } as const
}
