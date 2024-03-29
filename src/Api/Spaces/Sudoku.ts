import Cell from "../../Elems/MainElems/Cell"
import { IndexToNine, SudokuDigits, TwoDimensionalArray } from "../../Types"
import PureSudoku from "./PureSudoku"

/**
 * Wraps PureSudoku, to sync the data with the Cell components.
 * 
 * It is also used by the Sudoku component to indirectly access the Cell components. -.-
 * 
 * For sanity, this class should be kept very simple.
 */
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

   override set(x: IndexToNine, y: IndexToNine) {
      return {
         to: async (...candidates: SudokuDigits[]) => {
            this.data[x][y] = candidates

            // super calls set() before defining this.cells
            if (this.cells !== undefined) {
               await new Promise(resolve => {
                  this.cells[x][y]?.setCandidatesTo(candidates, () => resolve(undefined))
               })
            }
         }
      }
   }

   override clearCell(x: IndexToNine, y: IndexToNine) {
      this.data[x][y] = [1, 2, 3, 4, 5, 6, 7, 8, 9]
      this.cells[x][y]?.clearCandidates()
   }

   /**
    * Used for Cell initialization
    *
    * An alternate possibility is having the cell reflect the data, but
    * that allows inconsistencies between the visuals and the data.
    */
   addCell(cell: Cell) {
      this.cells[cell.props.row][cell.props.column] = cell
      this.data[cell.props.row][cell.props.column] = cell.state.candidates
   }

   removeCell(cell: Cell) {
      this.cells[cell.props.row][cell.props.column] = undefined
      // this.data[cell.props.row][cell.props.column] = cell.state.candidates
   }
}
