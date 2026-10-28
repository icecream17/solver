import Board from "../board";
import fish from "./fish";

/**
 * Same as xWing and swordfish, but with 4 lines
 */
export default function jellyfish(sudoku: Board) {
   return fish(4, sudoku)
}
