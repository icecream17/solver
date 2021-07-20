import { ALL_CANDIDATES, IndexToNine, INDICES_TO_NINE, SudokuDigits } from "../../Types"
import PureSudoku from "../PureSudoku"
import Solver from "../Solver"
import { boxAt } from "../Utils"

export default function hiddenSingles(sudoku: PureSudoku, _solver: Solver) {
   /**
    * The state for a candidate in a group
    * true = 0 found, hidden single still possible
    * [...] = 1 found, position of hidden single
    * false = 2+ found, hidden single not possible anymore
    */
   type PossibleState = boolean | [IndexToNine, IndexToNine]

   /**
    * For each group (row, column, or box) there are 9 candidates.
    * Digits go from 1 to 9
    *
    * So each group tracks the possibilities of each digit.
    */
   type PossibleGroup = [null, PossibleState, PossibleState, PossibleState, PossibleState, PossibleState, PossibleState, PossibleState, PossibleState, PossibleState]

   /** A group of rows or columns or boxes. */
   type PossibleGroups = [PossibleGroup, PossibleGroup, PossibleGroup, PossibleGroup, PossibleGroup, PossibleGroup, PossibleGroup, PossibleGroup, PossibleGroup]

   function nextState(currentState: PossibleState, row: IndexToNine, column: IndexToNine) {
      if (currentState === true) {
         return [row, column] as [IndexToNine, IndexToNine]
      }

      return false
   }

   function _CreateArrayOf9Groups (): PossibleGroups {
      return [
         [null, true, true, true, true, true, true, true, true, true],
         [null, true, true, true, true, true, true, true, true, true],
         [null, true, true, true, true, true, true, true, true, true],
         [null, true, true, true, true, true, true, true, true, true],
         [null, true, true, true, true, true, true, true, true, true],
         [null, true, true, true, true, true, true, true, true, true],
         [null, true, true, true, true, true, true, true, true, true],
         [null, true, true, true, true, true, true, true, true, true],
         [null, true, true, true, true, true, true, true, true, true],
      ]
   }

   const possible = {
      rows: _CreateArrayOf9Groups(),
      columns: _CreateArrayOf9Groups(),
      boxes: _CreateArrayOf9Groups(),
   }

   for (const row of INDICES_TO_NINE) {
      for (const column of INDICES_TO_NINE) {
         // Prevent hidden single when already solved
         if (sudoku.data[row][column].length === 1) {
            const candidate = sudoku.data[row][column][0]
            possible.rows[row][candidate] = false
            possible.columns[column][candidate] = false
            possible.boxes[boxAt(row, column)][candidate] = false
            continue;
         }

         for (const candidate of sudoku.data[row][column]) {
            possible.rows[row][candidate] = nextState(possible.rows[row][candidate], row, column)
            possible.columns[column][candidate] = nextState(possible.columns[column][candidate], row, column)
            possible.boxes[boxAt(row, column)][candidate] = nextState(possible.boxes[boxAt(row, column)][candidate], row, column)
         }
      }
   }

   let successcount = 0
   for (const candidate of ALL_CANDIDATES) {
      for (let i = 0; i < 9; i++) {
         const currentPossible = {
            row: possible.rows[i][candidate],
            column: possible.columns[i][candidate],
            box: possible.boxes[i][candidate],
         }
         if (typeof currentPossible.row !== "boolean") {
            successcount++
            sudoku.set(...currentPossible.row).to(candidate)
         }
         if (typeof currentPossible.column !== "boolean") {
            successcount++
            sudoku.set(...currentPossible.column).to(candidate)
         }
         if (typeof currentPossible.box !== "boolean") {
            successcount++
            sudoku.set(...currentPossible.box).to(candidate)
         }
      }
   }

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
