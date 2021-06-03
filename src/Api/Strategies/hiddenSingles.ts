import { IndexToNine, TwoDimensionalArray, SudokuDigits } from "../../Types"
import PureSudoku from "../PureSudoku"
import Solver from "../Solver"
import { boxAt } from "../Utils"

export default function hiddenSingles(sudoku: PureSudoku, _solver: Solver) {
   type PossibleState = boolean | [IndexToNine, IndexToNine]
   function nextState(currentState: PossibleState, row: IndexToNine, column: IndexToNine) {
      if (currentState === true) {
         return [row, column] as [IndexToNine, IndexToNine]
      }

      return false
   }

   // true = 0 found
   // (location) = 1 found
   // false = 2 found
   const possible = {
      rows: [] as TwoDimensionalArray<PossibleState>,
      columns: [] as TwoDimensionalArray<PossibleState>,
      boxes: [] as TwoDimensionalArray<PossibleState>,
   }

   // 9 rows, 9 candidates
   for (let i = 0; i < 9; i++) {
      possible.rows.push([true, true, true, true, true, true, true, true, true])
      possible.columns.push([true, true, true, true, true, true, true, true, true])
      possible.boxes.push([true, true, true, true, true, true, true, true, true])
   }

   for (let row: IndexToNine = 0; row < 9; row = row + 1 as IndexToNine) {
      for (let column: IndexToNine = 0; column < 9; column = column + 1 as IndexToNine) {
         for (const candidate of sudoku.data[row][column]) {
            possible.rows[row][candidate] = nextState(possible.rows[row][candidate], row, column)
            possible.columns[column][candidate] = nextState(possible.columns[column][candidate], row, column)
            possible.boxes[boxAt(row, column)][candidate] = nextState(possible.boxes[boxAt(row, column)][candidate], row, column)
         }
      }
   }

   let successcount = 0
   for (let candidate: IndexToNine = 0; candidate < 9; candidate = candidate + 1 as IndexToNine) {
      for (let i = 0; i < 9; i++) {
         const currentPossible = {
            row: possible.rows[i][candidate],
            column: possible.columns[i][candidate],
            box: possible.boxes[i][candidate],
         }
         if (typeof currentPossible.row !== "boolean") {
            successcount++
            sudoku.set(...currentPossible.row).to(candidate + 1 as SudokuDigits)
         }
         if (typeof currentPossible.column !== "boolean") {
            successcount++
            sudoku.set(...currentPossible.column).to(candidate + 1 as SudokuDigits)
         }
         if (typeof currentPossible.box !== "boolean") {
            successcount++
            sudoku.set(...currentPossible.box).to(candidate + 1 as SudokuDigits)
         }
      }
   }

   console.debug(possible.boxes[8][5])

   if (successcount !== 0) {
      return {
         success: true,
         successcount
      } as const
   }

   return {
      success: false
   } as const
}
