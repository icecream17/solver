import { ALL_CANDIDATES, IndexToNine, INDICES_TO_NINE, SudokuDigits } from "../../Types";
import PureSudoku from "../Spaces/PureSudoku";
import { CellID } from "../Utils";
import { colorGroup } from "../Utils.dependent";

type PossibleNth = Readonly<{
   lines: Set<CellID>[]
   sumLines: Set<CellID> // Set of all cells in the lines
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

   // Undifferentiate rows and columns
   const [patternLines, patternPendLines, lineProp, pendLineProp] =
      isRow
         ? [patternRows, patternColumns, "row", "columns"] as const
         : [patternColumns, patternRows, "column", "rows"] as const

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

/**
 * Updates the accumulated arrays and sets.
 * If an accumulated array reaches the required amount of lines, callback()
 */
function _accum (line: Set<CellID>, possibleNLines: PossibleNth[][], index: IndexToNine, size: 2 | 3 | 4, callback: (sumIthLines: Set<CellID>) => void) {
   const optimization = Math.max(index + size - 9, 0) // Example: If index = 8, size = 2,
   for (let i = possibleNLines.length - 1; i >= optimization; i--) {
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

         for (const [line, isRow, possibleNLines] of [[row, true, possibleNRows] as const, [column, false, possibleNColumns] as const]) {
            if (line.size <= size && line.size > 1) {
               // Optimization:
               // Say index = 6
               // Jellyfish (size 4) can't be made with only 6 7 8
               // But in can be made with 5 6 7 8
               if (9 - index >= size) {
                  possibleNLines[0].push({
                     lines: [line],
                     sumLines: new Set(line)
                  })
               }


               _accum(line, possibleNLines, index, size, sumLines => {
                  successcount += _innerWingLogic(candidate, candidateLocations, sudoku, sumLines, isRow, size) // eslint-disable-line no-loop-func
               })
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
