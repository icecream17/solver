import Cell from "../Elems/MainElems/Cell"
import { SudokuDigits } from "../Types"

export default class Sudoku {
   data: SudokuDigits[][][]
   cells: Cell[][]
   constructor () {
      this.data = [
         [], [], [],
         [], [], [],
         [], [], [],
      ]
      this.cells = [
         [], [], [],
         [], [], [],
         [], [], [],
      ]
   }

   setCandidates(x: number, y: number, candidates: SudokuDigits[]) {
      this.data[x][y] = candidates
      this.cells[x][y].setState({ candidates })
   }
}
