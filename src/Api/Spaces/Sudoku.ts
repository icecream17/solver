import Cell from "../../Elems/MainElems/Cell"
import { IndexToNine, SudokuDigits, TwoDimensionalArray } from "../../Types"
import PureSudoku from "./PureSudoku"

export default class Sudoku extends PureSudoku {
   cells: TwoDimensionalArray<Cell | undefined | null>
   constructor (...args: ConstructorParameters<typeof PureSudoku>) {
      super(...args)
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

            // super calls set() before this.cells is set
            if (this.cells !== undefined) {
               await new Promise(resolve => {
                  this.cells[x][y]?.setCandidatesTo(candidates, () => resolve(undefined))
               })
            }
         }
      }
   }

   /**
    * This is currently used for initialization, but could also be used for updating
    * That's pretty complicated
    */
   addCell(cell: Cell) {
      this.cells[cell.props.row][cell.props.column] = cell
      this.data[cell.props.row][cell.props.column] = cell.state.candidates
   }

   removeCell(cell: Cell) {
      this.cells[cell.props.row][cell.props.column] = undefined
      // this.data[cell.props.row][cell.props.column] = cell.state.candidates
   }

   clearCell(x: IndexToNine, y: IndexToNine) {
      this.data[x][y] = [1, 2, 3, 4, 5, 6, 7, 8, 9]
      this.cells[x][y]?.clearCandidates()
   }
}
