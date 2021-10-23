// @flow

import React from 'react';

import './Sudoku.css'
import Row from './Row';
import { IndexToNine, _Callback } from '../../Types';
import Cell from './Cell';

const keyboardMappings = {
   'ArrowUp': { vRow: -1, vColumn: 0 },
   'KeyW': { vRow: -1, vColumn: 0 },
   'ArrowLeft': { vRow: 0, vColumn: -1 },
   'KeyA': { vRow: 0, vColumn: -1 },
   'ArrowDown': { vRow: 1, vColumn: 0 },
   'KeyS': { vRow: 1, vColumn: 0 },
   'ArrowRight': { vRow: 0, vColumn: 1 },
   'KeyD': { vRow: 0, vColumn: 1 },
}

export type BaseSudokuProps = Readonly<{
   whenCellMounts: _Callback
   whenCellUnmounts: _Callback
   whenCellUpdates: _Callback
}>

type SudokuProps = BaseSudokuProps

/**
 * The main sudoku!!!
 * The sudoku board state is sent back all the way to `App.js`
 *
 * Handles keyboard interactions.
 * TODO: Handle selecting cells, including selecting multiple cells. (And set aria-selected and aria-multiselectable)
 *
 * @example
 * // Sending state up
 * <Sudoku whenUpdate={callback} />
 */
export default class Sudoku extends React.Component<SudokuProps> {
   tbodyElement: HTMLTableSectionElement | null;
   setTbodyElement: (element: HTMLTableSectionElement | null) => HTMLTableSectionElement | null;
   constructor(props: SudokuProps) {
      super(props)

      this.whenCellKeydown = this.whenCellKeydown.bind(this)

      this.tbodyElement = null
      this.setTbodyElement = (element: HTMLTableSectionElement | null) => this.tbodyElement = element
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
         // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role --- https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/issues/817
         <table className='Sudoku' id='Sudoku' title='Sudoku' aria-label='Sudoku' role='grid'>
            <tbody ref={this.setTbodyElement}>
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
    * Implicitly blurs the previously focused cell
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
      return this.getTableCellElement(row, column).children[0] as HTMLElement
   }

   /** Gets the cell _element_ at the row and column. */
   getTableCellElement(row: IndexToNine, column: IndexToNine): HTMLElement {
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

   /**
    * Keyboard controls as described by https://w3c.github.io/aria-practices/#grid
    * TODO: https://www.w3.org/TR/wai-aria-practices-1.1/#kbd_roving_tabindex
    */
   whenCellKeydown(cell: Cell, event: React.KeyboardEvent) {
      // Use default behavior when tabbing
      if (event.key === 'Tab') {
         return
      }

      event.preventDefault()

      // TODO: Diagonal steps, use onkeyup and more state
      if (event.key in keyboardMappings) {
         const step = keyboardMappings[(event.key as keyof typeof keyboardMappings)];

         this.focusCell(
            (cell.props.row + 9 + step.vRow) % 9 as IndexToNine,
            (cell.props.column + 9 + step.vColumn) % 9 as IndexToNine
         )
      } else if (event.key === 'Home') {
         if (event.ctrlKey) {
            this.focusCell(0, 0)
         } else {
            this.focusCell(cell.props.row, 0)
         }
      } else if (event.key === 'End') {
         if (event.ctrlKey) {
            this.focusCell(8, 8)
         } else {
            this.focusCell(cell.props.row, 8)
         }
      } else if (event.key === 'PageUp' && cell.props.row !== 0) {
         this.focusCell(Math.max(cell.props.row - 3, 0) as IndexToNine, cell.props.column)
      } else if (event.key === 'PageDown' && cell.props.row !== 8) {
         this.focusCell(Math.min(cell.props.row + 3, 8) as IndexToNine, cell.props.column)
      }
   }
}
