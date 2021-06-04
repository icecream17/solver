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

   /*override*/ set(x: IndexToNine, y: IndexToNine) {
      return {
         to: async (...candidates: SudokuDigits[]) => {
            this.data[x][y] = candidates
            await new Promise(resolve => {
               this.cells[x][y].setCandidatesTo(candidates, () => resolve(undefined))
            })
         }
      }
   }

   updateFromCell(cell: Cell) {
      this.cells[cell.props.row][cell.props.column] = cell
      this.data[cell.props.row][cell.props.column] = cell.state.candidates
   }

   clearCell(x: IndexToNine, y: IndexToNine) {
      this.data[x][y] = [1, 2, 3, 4, 5, 6, 7, 8, 9]
      this.cells[x][y].clearCandidates()
   }
}
