
import React from 'react';

import './Sudoku.css'
import Row from './Row';
import Cell from './Cell';
import { SudokuDigits } from '../../Types';

type SudokuProps = Readonly<{
   whenConstruct?(...args: any): any
} & typeof React.Component.prototype.props>

/**
 * The main sudoku!!!
 * The sudoku board state is sent back all the way to `App.js`
 *
 * @example
 * // Sending state up
 * <Sudoku whenConstruct={callback} />
 */
export default class Sudoku extends React.Component {
   props!: SudokuProps;
   data: Cell[][];
   element: null | HTMLTableElement;
   constructor(props: SudokuProps) {
      super(props)

      /**
       * When the cells are proccessed they're added:
       * ```js
       * // In cell setup
       * callback()
       *
       * // Sudoku callback
       * this.data[cell.row][cell.column] = cell
       * ```
       *
       * @name Sudoku.data
       * @type Cell[][]
       * @default [[], [], [], [], [], [], [], [], []]
       */
      this.data = []
      for (let i = 0; i < 9; i++) {
         this.data[i] = []
      }

      this.updateInnerArray = this.updateInnerArray.bind(this)
      this.element = null

      // HELP: this.props === undefined !??
      /** See App.js - this if statement is anticipating future code changes */
      if ("whenConstruct" in this.props) {
         (this.props as Readonly<{
            whenConstruct(...args: any): any
         } & typeof React.Component.prototype.props>).whenConstruct(this)
      } else {
         console.warn("Remove useless code in Sudoku.js")
      }
   }

   render() {
      return (
         <table
            className='Sudoku'
            id='Sudoku'
            title='Sudoku'
            aria-label='Sudoku'
            ref={element => this.element = element}
         >
            <tbody>
               <Row index={0} whenCellConstructs={this.updateInnerArray} />
               <Row index={1} whenCellConstructs={this.updateInnerArray} />
               <Row index={2} whenCellConstructs={this.updateInnerArray} />
               <Row index={3} whenCellConstructs={this.updateInnerArray} />
               <Row index={4} whenCellConstructs={this.updateInnerArray} />
               <Row index={5} whenCellConstructs={this.updateInnerArray} />
               <Row index={6} whenCellConstructs={this.updateInnerArray} />
               <Row index={7} whenCellConstructs={this.updateInnerArray} />
               <Row index={8} whenCellConstructs={this.updateInnerArray} />
            </tbody>
         </table>
      )
   }

   /** Gets the cell _element_ at the row and column. */
   getCell(row: SudokuDigits, column: SudokuDigits) {
      if (this.data[row][column] !== undefined) {
         return this.data[row][column]
      }
      // if (this.element.current === null) {
      //    throw new TypeError('null element??')
      // }

      return this.getRow(row).children[column]
   }

   /** Gets the row _element_ at the index provided */
   getRow(index: SudokuDigits): Element {
      if (this.element === null) {
         throw new TypeError('null element??')
      }

      // this.element > tbody > row
      return (this.element.firstChild as HTMLTableRowElement).children[index]
   }

   updateInnerArray(cell: Cell) {
      this.data[cell.props.row][cell.props.column] = cell
   }
}
