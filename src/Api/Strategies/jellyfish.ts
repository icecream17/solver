import PureSudoku from "../Spaces/PureSudoku";
import fish from "./fish";

/**
 * Same as xWing and swordfish, but with 4 lines
 */
export default function jellyfish(sudoku: PureSudoku) {
   return fish(4, sudoku)
}
