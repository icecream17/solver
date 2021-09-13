
import React from 'react';

import './Sudoku.css'
import Row from './Row';
import SudokuData from '../../Api/Spaces/Sudoku';
import { HasWhenConstruct, IndexToNine, PossibleConstructCallback, SudokuDigits } from '../../Types';
import Cell, { keyboardMappings } from './Cell';

/**
 * The main sudoku!!!
 * The sudoku board state is sent back all the way to `App.js`
 *
 * @example
 * // Sending state up
 * <Sudoku whenUpdate={callback} />
 */
export default class Sudoku extends React.Component<PossibleConstructCallback> {
   data: SudokuData;
   tbodyElement: HTMLTableSectionElement | null;
   constructor(props: PossibleConstructCallback) {
      super(props)

      /**
       * Cells are added to the sudokudata as they are mounted
       * ```js
       * // In cell setup
       * callback()
       *
       * // Sudoku callback
       * this.data.updateFromCell(cell)
       * ```
       *
       * @name Sudoku.data
       */
      this.data = new SudokuData();

      this.whenCellMounts = this.whenCellMounts.bind(this)
      this.whenCellUnmounts = this.whenCellUnmounts.bind(this)
      this.whenCellUpdates = this.whenCellUpdates.bind(this)
      this.whenCellKeydown = this.whenCellKeydown.bind(this)

      /** See App.js - this if statement is anticipating future code changes */
      if (HasWhenConstruct(this.props)) {
         this.props.whenConstruct(this)
      } else {
         console.warn("Remove useless code in Sudoku.js")
      }

      this.tbodyElement = null
   }

   render() {
      let index: IndexToNine = 0
      const getRepeatedProps = () => {
         return {
            index: index++ as IndexToNine,
            propsPassedDown: {
               whenCellMounts: this.whenCellMounts,
               whenCellUnmounts: this.whenCellUnmounts,
               whenNewCandidates: this.whenCellUpdates,
               whenKeyboardArrows: this.whenCellKeydown,
            } as const
         } as const
      }

      return (
         <table className='Sudoku' id='Sudoku' title='Sudoku' aria-label='Sudoku'>
            <tbody ref={elem => (this.tbodyElement = elem)}>
               <Row {...getRepeatedProps()} />
               <Row {...getRepeatedProps()} />
               <Row {...getRepeatedProps()} />
               <Row {...getRepeatedProps()} />
               <Row {...getRepeatedProps()} />
               <Row {...getRepeatedProps()} />
               <Row {...getRepeatedProps()} />
               <Row {...getRepeatedProps()} />
               <Row {...getRepeatedProps()} />
            </tbody>
         </table>
      )
   }

   /**
    * INCOMPLETELY DOCUMENTED BUG: This focuses the element, but often the
    */
   focusCell(row: IndexToNine, column: IndexToNine) {
      this.getCellElement(row, column).focus()
   }

   /**
    * Gets the cell _element_ at the row and column.
    * Nowadays, the cell is a <td> containing a <button> for a11y reasons.
    * So this returns the <button> since that's what's actually important.
    */
   getCellElement(row: IndexToNine, column: IndexToNine): HTMLElement {
      const result = this.getTableCellElement(row, column).children[0] as HTMLElement
      return result
   }

   /** Gets the cell _element_ at the row and column. */
   getTableCellElement(row: IndexToNine, column: IndexToNine): HTMLElement {
      const result = this.getRowElement(row).children[column] as HTMLElement
      return result
   }

   /** Gets the row _element_ at the index provided */
   getRowElement(index: IndexToNine) {
      if (this.tbodyElement === null) {
         throw new TypeError('null element??')
      }

      // this.element > tbody > row
      return this.tbodyElement.children[index]
   }

   whenCellMounts(cell: Cell) {
      this.data.addCell(cell)
   }

   whenCellUnmounts(cell: Cell) {
      this.data.removeCell(cell)
   }

   whenCellUpdates(cell: Cell, candidates: SudokuDigits[]) {
      this.data.data[cell.props.row][cell.props.column] = candidates
   }

   whenCellKeydown(cell: Cell, event: React.KeyboardEvent) {
      event.preventDefault()

      // TODO: Diagonal steps, use onkeyup and more state
      const step = keyboardMappings[(event.key as keyof typeof keyboardMappings)];

      // blur this and focus the other cell
      (event.target as HTMLTableCellElement).blur()

      this.focusCell(
         (cell.props.row + 9 + step.vRow) % 9 as IndexToNine,
         (cell.props.column + 9 + step.vColumn) % 9 as IndexToNine
      )
   }
}
