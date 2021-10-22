import { ALL_CANDIDATES, IndexToNine, INDICES_TO_NINE, SudokuDigits, _Callback } from "../../Types";
import PureSudoku from "../Spaces/PureSudoku";
import { CellID } from "../Utils";
import { colorGroup } from "../Utils.dependent";

type PossibleNth = Readonly<{
   lines: Set<CellID>[],
   sumLines: Set<CellID>
}>

function _innerWingLogic(
   candidate: SudokuDigits,
   candidateLocations: ReturnType<typeof PureSudoku.prototype.getCandidateLocations>,
   sudoku: PureSudoku,
   sumLines: Set<CellID>,
   isRow: boolean,
   wingSize: number
) {
   const patternRows = new Set<IndexToNine>()
   const patternColumns = new Set<IndexToNine>()
   for (const cell of sumLines) {
      patternRows.add(cell.row)
      patternColumns.add(cell.column)
   }

   const { patternLines, patternPendLines } =
      isRow
         ? { patternLines: patternRows, patternPendLines: patternColumns }
         : { patternLines: patternColumns, patternPendLines: patternRows }

   const { lineProp, pendLineProp } =
      isRow
         ? { lineProp: "row", pendLineProp: "columns" } as const
         : { lineProp: "column", pendLineProp: "rows" } as const

   if (patternPendLines.size <= wingSize) {
      // Pattern finally identified!
      let success = false

      for (const eliminationPendLine of patternPendLines) {
         for (const cell of candidateLocations[candidate][pendLineProp][eliminationPendLine]) {
            if (patternLines.has(cell[lineProp]) === false) {
               sudoku.remove(candidate).at(cell.row, cell.column)
               colorGroup(sudoku, sumLines, candidate)
               success = true
            }
         }
      }

      if (success) {
         return 1
      }
   }

   return 0
}


// Optimization:
// Say index = 7
// Jellyfish (size 4) can't be made with only [6] + 7 8
// But in can be made with [5 6] 7 8
function _check (line: Set<CellID>, possibleNLines: PossibleNth[][], index: IndexToNine, size: 2 | 3 | 4, callback: (sumIthLines: Set<CellID>) => void) {
   for (let i = possibleNLines.length - 1; i >= 0 && (9 - index >= size - i); i--) {
      for (const ithLines of possibleNLines[i]) {
         const sumIthLines = new Set(ithLines.sumLines)
         line.forEach(cell => sumIthLines.add(cell))

         if (sumIthLines.size <= size * size) {
            if (i + 1 === size) {
               callback(sumIthLines)
            } else {
               possibleNLines[i + 1].push({
                  lines: [...ithLines.lines, line],
                  sumLines: sumIthLines
               })
            }
         }
      }
   }
}

/**
 * See Strategies.md#fish
 */
export default function fish (size: 2 | 3 | 4, sudoku: PureSudoku) {
   let successcount = 0

   const candidateLocations = sudoku.getCandidateLocations()
   for (const candidate of ALL_CANDIDATES) {
      const possibleNRows = [] as PossibleNth[][]
      const possibleNColumns = [] as PossibleNth[][]
      for (let i = 0; i < size; i++) {
         possibleNRows.push([])
         possibleNColumns.push([])
      }

      for (const index of INDICES_TO_NINE) {
         const row = candidateLocations[candidate].rows[index]
         const column = candidateLocations[candidate].columns[index]

         if (row.size <= size && row.size > 1) {
            // Optimization:
            // Say index = 6
            // Jellyfish (size 4) can't be made with only 6 7 8
            // But in can be made with 5 6 7 8
            if (9 - index >= size) {
               possibleNRows[0].push({
                  lines: [row],
                  sumLines: new Set(row)
               })
            }

            _check(row, possibleNRows, index, size, sumLines => {
               successcount += _innerWingLogic(candidate, candidateLocations, sudoku, sumLines, true, size)
            })
         }

         if (column.size <= size && column.size > 1) {
            if (9 - index >= size) {
               possibleNColumns[0].push({
                  lines: [column],
                  sumLines: new Set(column)
               })
            }

            _check(column, possibleNColumns, index, size, sumLines => {
               successcount += _innerWingLogic(candidate, candidateLocations, sudoku, sumLines, false, size)
            })
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
