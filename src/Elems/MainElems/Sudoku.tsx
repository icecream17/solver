
import React from 'react';

import './Sudoku.css'
import Row from './Row';
import SudokuData from '../../Api/Sudoku';
import { HasWhenConstruct, IndexToNine, PossibleConstructCallback } from '../../Types';
import Cell from './Cell';

/**
 * The main sudoku!!!
 * The sudoku board state is sent back all the way to `App.js`
 *
 * @example
 * // Sending state up
 * <Sudoku whenUpdate={callback} />
 */
export default class Sudoku extends React.Component {
   data: SudokuData;
   props: PossibleConstructCallback;
   tbodyElement: HTMLTableSectionElement | null;
   constructor(props: PossibleConstructCallback) {
      super(props)
      this.props = props // WHY

      /**
       * Cells are added as they are processed
       * ```js
       * // In cell setup
       * callback()
       *
       * // Sudoku callback
       * this.data.cells[cell.row][cell.column] = cell
       * ```
       *
       * @name Sudoku.data
       */
      this.data = new SudokuData();

      this.updateInnerArray = this.updateInnerArray.bind(this)

      /** See App.js - this if statement is anticipating future code changes */
      if (HasWhenConstruct(this.props)) {
         this.props.whenConstruct(this)
      } else {
         console.warn("Remove useless code in Sudoku.js")
      }

      this.tbodyElement = null
   }

   render() {
      return (
         <table className='Sudoku' id='Sudoku' title='Sudoku' aria-label='Sudoku'>
            <tbody ref={elem => this.tbodyElement = elem}>
               <Row index={0} whenCellConstructs={this.updateInnerArray} parent={this} />
               <Row index={1} whenCellConstructs={this.updateInnerArray} parent={this} />
               <Row index={2} whenCellConstructs={this.updateInnerArray} parent={this} />
               <Row index={3} whenCellConstructs={this.updateInnerArray} parent={this} />
               <Row index={4} whenCellConstructs={this.updateInnerArray} parent={this} />
               <Row index={5} whenCellConstructs={this.updateInnerArray} parent={this} />
               <Row index={6} whenCellConstructs={this.updateInnerArray} parent={this} />
               <Row index={7} whenCellConstructs={this.updateInnerArray} parent={this} />
               <Row index={8} whenCellConstructs={this.updateInnerArray} parent={this} />
            </tbody>
         </table>
      )
   }

   focusCell(row: IndexToNine, column: IndexToNine) {
      this.getCellElement(row, column).focus()
   }

   /** Gets the cell _element_ at the row and column. */
   getCellElement(row: IndexToNine, column: IndexToNine): HTMLElement {
      return this.getRowElement(row).children[column] as HTMLElement
   }

   /** Gets the row _element_ at the index provided */
   getRowElement(index: IndexToNine) {
      if (this.tbodyElement === null) {
         throw new TypeError('null element??')
      }

      // this.element > tbody > row
      return this.tbodyElement.children[index]
   }

   /** Gets the cell _instance_ at the row and column. */
   getCell(row: IndexToNine, column: IndexToNine) {
      if (this.data.cells[row][column] !== undefined) {
         return this.data.cells[row][column]
      }
   }

   updateInnerArray(cell: Cell) {
      this.data.cells[cell.props.row][cell.props.column] = cell
   }
}
