import PureSudoku from "../Spaces/PureSudoku"
import fish from "./fish";

/**
 * Same as xWing, but with 3 lines
 */
export default function swordfish(sudoku: PureSudoku) {
   return fish(3, sudoku)
}
