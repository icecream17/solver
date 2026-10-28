import Board from "../board"
import fish from "./fish";

/**
 * Same as xWing, but with 3 lines
 */
export default function swordfish(sudoku: Board) {
   return fish(3, sudoku)
}
