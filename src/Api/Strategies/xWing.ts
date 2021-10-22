import PureSudoku from "../Spaces/PureSudoku"
import fish from "./fish";

/**
 * 2 candidates in 2 rows, which align on 2 columns
 *
 * or
 *
 * 2 candidates in 2 columns, which align on 2 rows
 */
export default function xWing (sudoku: PureSudoku) {
   return fish(2, sudoku)
}
