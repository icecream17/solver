/**
 * Same as Utils, but ones dependent on other files.
 *
 * Might want to run `madge --circular --extensions ts ./src` after importing from here
 */

import { SudokuDigits, INDICES_TO_NINE } from "../Types";
import PureSudoku from "./Spaces/PureSudoku";
import Sudoku from "./Spaces/Sudoku";
import { CellID, id } from "./Utils";

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

