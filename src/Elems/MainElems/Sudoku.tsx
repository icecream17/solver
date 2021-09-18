// @flow

import React from 'react';

import './Sudoku.css'
import Row from './Row';
import { IndexToNine, PossibleConstructCallback, _Function } from '../../Types';
import Cell, { keyboardMappings } from './Cell';

export type BaseSudokuProps = Readonly<{
   whenCellMounts: _Function
   whenCellUnmounts: _Function
   whenCellUpdates: _Function
}>

type SudokuProps = BaseSudokuProps & PossibleConstructCallback

/**
 * The main sudoku!!!
 * The sudoku board state is sent back all the way to `App.js`
 *
 * @example
 * // Sending state up
 * <Sudoku whenUpdate={callback} />
 */
export default class Sudoku extends React.Component<SudokuProps> {
   tbodyElement: HTMLTableSectionElement | null;
   constructor(props: SudokuProps) {
      super(props)

      this.whenCellKeydown = this.whenCellKeydown.bind(this)

      /** See App.js - this if statement is anticipating future code changes */
      this.props.whenConstruct?.(this)

      this.tbodyElement = null
   }

   render() {
      let index: IndexToNine = 0
      const getRepeatedProps = () => {
         return {
            index: index++ as IndexToNine,
            propsPassedDown: {
               whenCellMounts: this.props.whenCellMounts,
               whenCellUnmounts: this.props.whenCellUnmounts,
               whenNewCandidates: this.props.whenCellUpdates,
               whenCellKeydown: this.whenCellKeydown,
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
