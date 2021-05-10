
import React from 'react';

import './Sudoku.css'
import Row from './Row';

/**
 * The main sudoku!!!
 * The sudoku board state is sent back all the way to `App.js`
 *
 * @example
 * // Sending state up
 * <Sudoku whenUpdate={callback} />
 *
 * @requiredProps
 * - whenUpdate
 */
export default class Sudoku extends React.Component {
   constructor(props) {
      for (const requiredProperty of ["whenUpdate"]) {
         if (!(requiredProperty in props)) {
            throw TypeError(`Sudoku: Required property "${requiredProperty}" is missing`)
         }
      }

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
       * @name Sudoku#data
       * @type {Cell[][]}
       * @default {[[], [], [], [], [], [], [], [], []]}
       */
      this.data = []
      for (let i = 0; i < 9; i++) {
         this.data[i] = []
      }

      this.updateInnerArray = this.updateInnerArray.bind(this)
   }

   render() {
      return (
         <table className='Sudoku' id='Sudoku' title='Sudoku' aria-label='Sudoku'>
            <tbody>
               <Row index={0} callback={this.updateInnerArray} />
               <Row index={1} callback={this.updateInnerArray} />
               <Row index={2} callback={this.updateInnerArray} />
               <Row index={3} callback={this.updateInnerArray} />
               <Row index={4} callback={this.updateInnerArray} />
               <Row index={5} callback={this.updateInnerArray} />
               <Row index={6} callback={this.updateInnerArray} />
               <Row index={7} callback={this.updateInnerArray} />
               <Row index={8} callback={this.updateInnerArray} />
            </tbody>
         </table>
      )
   }

   /** Gets the cell _element_ at the row and column. */
   getCell(row, column) {
      if (this.data[row][column] !== undefined) {
         return this.data[row][column]
      }
      // if (this.element.current === null) {
      //    throw new TypeError('null element??')
      // }

      return this.getRow(row).children[column]
   }

   /** Gets the row _element_ at the index provided */
   getRow(index) {
      if (this.element.current === null) {
         throw new TypeError('null element??')
      }

      // this.element > tbody > row
      return this.element.current.firstChild.children[index]
   }

   updateInnerArray(cell) {
      this.data[cell.props.row][cell.props.column] = cell
      this.props.whenUpdate(this) // See props.whenUpdate
   }
}
