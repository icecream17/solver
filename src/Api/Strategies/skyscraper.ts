import { ALL_CANDIDATES, IndexToNine, INDICES_TO_NINE, SudokuDigits } from "../../Types";
import PureSudoku from "../Spaces/PureSudoku";
import { affects, CellID, sharedInArrays } from "../Utils";
import { colorGroup } from "../Utils.dependent";

export function __incrementMapValue<T extends Map<K, number>, K>(map: T, key: K) {
   const value = map.get(key)
   if (value === undefined) {
      map.set(key, 1)
   } else {
      map.set(key, value + 1)
   }
}

function _innerInnerSkyscraperLogic(
   candidate: SudokuDigits,
   sudoku: PureSudoku,
   sumLines: Set<CellID>,
   isRow: boolean,
   wingSize: number
) {
   const patternPendLines = new Map<IndexToNine, number>()
   const pendLineProp = isRow ? "column" : "row"
   for (const cell of sumLines) {
      __incrementMapValue(patternPendLines, cell[pendLineProp])
   }

   if (patternPendLines.size === wingSize + 1) {
      for (const [eliminationPendLine, count] of patternPendLines) {
         if (count > 1) {
            const cellsNotInLine = [] as CellID[]
            const affectsNotInLine = [] as CellID[][]
            for (const cell of sumLines) {
               if (cell[pendLineProp] !== eliminationPendLine) {
                  cellsNotInLine.push(cell)
                  affectsNotInLine.push(affects(cell.row, cell.column))
               }
            }

            // shared = all extra see
            const shared = sharedInArrays(...affectsNotInLine)

            if (shared.size > 0) {
               let success = false
               for (const cell of shared) {
                  if (sudoku.data[cell.row][cell.column].includes(candidate)) {
                     sudoku.remove(candidate).at(cell.row, cell.column)
                     success = true
                  }
               }

               if (success) {
                  colorGroup(sudoku, sumLines, candidate)
                  colorGroup(sudoku, cellsNotInLine, candidate, "orange")
                  return {
                     success: true,
                     successcount: 1
                  } as const
               }
            }
         }
      }
   }

   return null
}

function _innerSkyscraperLogic(line1: Set<CellID>, possibleLines: Set<CellID>[], candidate: SudokuDigits, sudoku: PureSudoku, isRow: boolean) {
   // line = row/column
   // pendLine = column/row
   for (const line2 of possibleLines) {
      const sumLines = new Set<CellID>()
      line1.forEach(cell => sumLines.add(cell))
      line2.forEach(cell => sumLines.add(cell))

      if (sumLines.size < 5) {
         const result = _innerInnerSkyscraperLogic(candidate, sudoku, sumLines, isRow, 2)
         if (result !== null) {
            return result
         }
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
export default function skyscraper(sudoku: PureSudoku) {
   const candidateLocations = sudoku.getCandidateLocations()
   for (const candidate of ALL_CANDIDATES) {
      const possibleRows = [] as Set<CellID>[]
      const possibleColumns = [] as Set<CellID>[]
      for (const index of INDICES_TO_NINE) {
         const row = candidateLocations[candidate].rows[index]
         const column = candidateLocations[candidate].columns[index]

         if (row.size < 3) {
            const result = _innerSkyscraperLogic(row, possibleRows, candidate, sudoku, true)
            if (result !== null) {
               return result
            }

            possibleRows.push(row)
         }

         if (column.size < 3) {
            const result = _innerSkyscraperLogic(column, possibleColumns, candidate, sudoku, false)
            if (result !== null) {
               return result
            }

            possibleColumns.push(column)
         }
      }
   }

   return {
      success: false
   } as const
}
