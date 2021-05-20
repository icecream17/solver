import Cell from "../Elems/MainElems/Cell"
import { IndexToNine, SudokuDigits, TwoDimensionalArray } from "../Types"
import PureSudoku, { SudokuConstructorOptions } from "./PureSudoku"

export default class Sudoku extends PureSudoku {
   cells: TwoDimensionalArray<Cell>
   constructor (options: SudokuConstructorOptions = {}) {
      super(options)
      if (this.data === undefined) {
         throw TypeError('Super constructor PureSudoku didnt initialize this.data')
      }

      this.cells = [
         [], [], [],
         [], [], [],
         [], [], [],
      ]
   }

   set(x: IndexToNine, y: IndexToNine) {
      return {
         to: (...candidates: SudokuDigits[]) => {
            this.data[x][y] = candidates
            this.cells[x][y].setCandidates(candidates)
         }
      }
   }

   updateFromCell(cell: Cell) {
      this.cells[cell.props.row][cell.props.column] = cell
      this.data[cell.props.row][cell.props.column] = cell.state.candidates
   }
}
