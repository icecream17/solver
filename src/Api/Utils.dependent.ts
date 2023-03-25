/**
 * Same as Utils, but ones dependent on other files.
 *
 * Might want to run `madge --circular --extensions ts ./src` after importing from here
 */

import { SudokuDigits, INDICES_TO_NINE, IndexToNine } from "../Types";
import PureSudoku from "./Spaces/PureSudoku";
import Sudoku from "./Spaces/Sudoku";
import { CandidateID, CellID, id } from "./Utils";

/**
 * Highlights a cell, see {@link Cell#highlight}
 * Default background is blue.
 */
export function highlightCell (sudoku: PureSudoku, {row, column}: CellID, color = 'blue') {
   if (sudoku instanceof Sudoku) {
      sudoku.cells[row][column]?.addClass(color)
   }
}

/**
 * Highlights a cell, see {@link Cell#highlight}
 * Default background is blue.
 */
export function highlightGroup (sudoku: PureSudoku, group: Iterable<CellID>, color = 'blue') {
   if (sudoku instanceof Sudoku) {
      for (const {row, column} of group) {
         sudoku.cells[row][column]?.addClass(color)
      }
   }
}

/**
 * Colors a group of cells' candidates, see {@link Cell#highlight}
 *
 * The precedence for colors is:
 * 1. orange
 * 2. green
 * 3. blue
 */
export function colorGroup (sudoku: PureSudoku, group: Iterable<CellID>, candidate: SudokuDigits, color = 'blue') {
   if (sudoku instanceof Sudoku) {
      for (const cell of group) {
         const element = sudoku.cells[cell.row][cell.column];
         element?.highlight([candidate], color);
      }
   }
}

/**
 * Same as {@link colorGroup}, but this time with a specific candidate
 */
export function colorCandidateF (sudoku: PureSudoku, row: IndexToNine, column: IndexToNine, digit: SudokuDigits, color = 'blue') {
   if (sudoku instanceof Sudoku) {
      sudoku.cells[row][column]?.highlight([digit], color)
   }
}

/**
 * Same as {@link colorGroup}, but this time with a specific candidate
 */
export function colorCandidate (sudoku: PureSudoku, { row, column, digit }: CandidateID, color = 'blue') {
   colorCandidateF(sudoku, row, column, digit, color)
}

export function numberOfCellsWithNCandidates (sudoku: PureSudoku, N: number) {
   const cellsWithNCandidates = 0
   for (const row of INDICES_TO_NINE) {
      for (const column of INDICES_TO_NINE) {
         if (sudoku.data[row][column].length === N) {
            cellsWithNCandidates++
         }
      }
   }

   return cellsWithNCandidates
}

export function getCellsWithNCandidates (sudoku: PureSudoku, N: number) {
   const cellsWithNCandidates = [] as CellID[]
   for (const row of INDICES_TO_NINE) {
      for (const column of INDICES_TO_NINE) {
         if (sudoku.data[row][column].length === N) {
            cellsWithNCandidates.push(id(row, column))
         }
      }
   }

   return cellsWithNCandidates
}

/**
 * Removes a {@param candidate} from multiple {@param cells}
 * if that candidate exists.
 *
 * Returns true if any candidates were eliminated
 */
export function removeCandidateFromCells(sudoku: PureSudoku, candidate: SudokuDigits, cells: Iterable<CellID>) {
   // Should this return early if there are no cells?
   let success = false
   for (const {row, column} of cells) {
      if (sudoku.data[row][column].includes(candidate)) {
         sudoku.remove(candidate).at(row, column)
         success = true
      }
   }
   return success
}

export function wouldRemoveCandidateFromCells(sudoku: PureSudoku, candidate: SudokuDigits, cells: Iterable<CellID>) {
   for (const { row, column } of cells) {
      if (sudoku.data[row][column].includes(candidate)) {
         return true
      }
   }
   return false
}
