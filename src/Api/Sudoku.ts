import Cell from "../Elems/MainElems/Cell"
import { IndexToNine, SudokuDigits } from "../Types"
import PureSudoku from "./PureSudoku"

type TwoDimensionalArray<T> = Array<Array<T>>

export default class Sudoku extends PureSudoku {
   data: TwoDimensionalArray<SudokuDigits[]>
   cells: TwoDimensionalArray<Cell>
   constructor () {
      super()
      this.data ??= [
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

   setCandidates(x: IndexToNine, y: IndexToNine, candidates: SudokuDigits[]) {
      this.data[x][y] = candidates
      this.cells[x][y].setState({ candidates })
   }

   updateFromCell(cell: Cell) {
      this.cells[cell.props.row][cell.props.column] = cell
      this.data[cell.props.row][cell.props.column] = cell.state.candidates
   }
}
