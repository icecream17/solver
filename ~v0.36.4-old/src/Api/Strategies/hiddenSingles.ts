import { ALL_CANDIDATES, IndexToNine, INDICES_TO_NINE, SudokuDigits } from "../../Types"
import PureSudoku from "../Spaces/PureSudoku"
import { boxAt } from "../Utils"
import { colorCandidateF } from "../Utils.dependent"

/**
 * The state for a candidate in a group
 * At the beginning, the state isn't set. This is practically undefined
 * undefined = 0 found
 * [...] = 1 found, position of hidden single
 * false = 2+ found, hidden single not possible anymore
 */
type PossibleState = false | {
   row: IndexToNine
   column: IndexToNine
}

/**
 * For each group (row, column, or box) there are 9 candidates.
 * Digits go from 1 to 9
 *
 * So each group tracks the possibilities of each digit.
 */
type PossibleGroup = Partial<Record<SudokuDigits, PossibleState>>

/** A group of rows or columns or boxes. */
type PossibleGroups = [PossibleGroup, PossibleGroup, PossibleGroup, PossibleGroup, PossibleGroup, PossibleGroup, PossibleGroup, PossibleGroup, PossibleGroup]

function _CreateArrayOf9Groups (): PossibleGroups {
   return [
      {}, {}, {},
      {}, {}, {},
      {}, {}, {},
   ] as PossibleGroups
}


function _nextState (currentState: PossibleState | undefined, row: IndexToNine, column: IndexToNine) {
   if (currentState === undefined) {
      return { row, column }
   }

   return false
}


export default function hiddenSingles(sudoku: PureSudoku) {
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
         } else {
            const box = boxAt(row, column)
            for (const candidate of sudoku.data[row][column]) {
               possible.rows[row][candidate] = _nextState(possible.rows[row][candidate], row, column)
               possible.columns[column][candidate] = _nextState(possible.columns[column][candidate], row, column)
               possible.boxes[box][candidate] = _nextState(possible.boxes[box][candidate], row, column)
            }
         }
      }
   }

   let successcount = 0
   for (const candidate of ALL_CANDIDATES) {
      for (let i = 0; i < 9; i++) {
         const currentPossible = [
            possible.rows[i][candidate],
            possible.columns[i][candidate],
            possible.boxes[i][candidate],
         ]

         for (const cell of currentPossible) {
            if (cell !== false && cell !== undefined) {
               successcount++
               sudoku.set(cell.row, cell.column).to(candidate)
               colorCandidateF(sudoku, cell.row, cell.column, candidate, 'solved')
            }
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
