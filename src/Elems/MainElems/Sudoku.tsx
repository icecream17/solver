import './Sudoku.css'
import React from 'react'

import Row from './Row'
import Cell from './Cell'
import { CouldAIsB, IndexToNine, SudokuDigits, _Callback } from '../../Types'
import { CellID, id } from '../../Api/Utils'
import SudokuData from '../../Api/Spaces/Sudoku'
import { keysPressed } from '../../keyboardListener'

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

type CellCallbackProps = {
   whenCellMounts: _Callback
   whenCellUnmounts: _Callback
   whenCellUpdates: _Callback
}

export type SudokuProps = Readonly<
   {
      sudoku: SudokuData
   } & CellCallbackProps
>

/**
 * The main sudoku!!!
 * The sudoku board state is sent back all the way to `App.js`
 *
 * ***!important*** \
 * It is imperative the cells props do not change. If they do, by default the candidates would be 1 to 9, basically
 * deleting progress and losing data. Additionally, the cell handles highlighting and interactions. It would be a large
 * effort to lift all that for the sudoku to handle.
 * 
 * So instead of changing the candidates through props, we change the candidate's state by accessing the cells
 * through the SudokuData, and calling methods on those cells. It is quite indirect and feels hacky, and it establishes
 * the SudokuData api as _required_ and immutable.
 * 
 * Handles keyboard interactions.
 * TODO: Handle selecting cells, including selecting multiple cells. (And set aria-selected and aria-multiselectable)
 *
 * @example
 * // Sending state up
 * <Sudoku whenUpdate={callback} />
 */
export default class Sudoku extends React.Component<SudokuProps> {
   cellsSelected: Set<CellID>
   selectionStatus: null | boolean // null = unselected, false = inactive, true = active selection

   tbodyElement: HTMLTableSectionElement | null
   setTbodyElement: (element: HTMLTableSectionElement | null) => HTMLTableSectionElement | null
   constructor(props: SudokuProps) {
      super(props)

      this.cellsSelected = new Set<CellID>()
      this.selectionStatus = null
      this.listener = this.listener.bind(this)

      this.whenCellBlur = this.whenCellBlur.bind(this)
      this.whenCellFocus = this.whenCellFocus.bind(this)
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
               whenCellBlur: this.whenCellBlur,
               whenCellFocus: this.whenCellFocus,
               whenCellKeydown: this.whenCellKeydown,
            } as const
         } as const
      }

      return (
         // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role --- https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/issues/817
         <table className='Sudoku' id='Sudoku' title='Sudoku' aria-label='Sudoku' aria-multiselectable={true} role='grid'>
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

   listener() {
      // TODO
   }

   syncSelectionStatus() {
      for (const row of this.props.sudoku.cells) {
         for (const cell of row) {
            if (cell != null) {
               const isSelected = this.cellsSelected.has(cell.id)
               cell.updateSelectionStatus(isSelected, this.selectionStatus)
            }
         }
      }
   }

   /**
    * Implicitly blurs the previously focused cell
    * INCOMPLETELY DOCUMENTED BUG: This focuses the element, but often the
    */
   focusCell(row: IndexToNine, column: IndexToNine) {
      this.getCellElement(row, column).focus()
   }

   focusIfTargetMovedAndAddToSelection(row: IndexToNine, column: IndexToNine, targetMoved: boolean, newSelected: Set<CellID>) {
      if (targetMoved) {
         this.focusCell(row, column)
      }
      newSelected.add(id(row, column))
   }

   isCellElement(element: null | Element): CouldAIsB<typeof element, HTMLButtonElement> {
      //     button, td,            row,           tbody
      return element?.parentElement?.parentElement?.parentElement === this.tbodyElement
   }

   /**
    * Gets the cell _element_ at the row and column.
    * Nowadays, the cell is a <td> containing a <button> for a11y reasons.
    * So this returns the <button> since that's what's actually important.
    */
   getCellElement(row: IndexToNine, column: IndexToNine): HTMLButtonElement {
      return this.getTableCellElement(row, column).children[0] as HTMLButtonElement
   }

   /** Gets the cell _element_ at the row and column. */
   getTableCellElement(row: IndexToNine, column: IndexToNine): HTMLTableCellElement {
      return this.getRowElement(row).children[column] as HTMLTableCellElement
   }

   /** Gets the row _element_ at the index provided */
   getRowElement(index: IndexToNine) {
      if (this.tbodyElement === null) {
         throw new TypeError('null element??')
      }

      // this.element > tbody > row
      return this.tbodyElement.children[index]
   }

   // TODO: Support Shift
   // The effect of Shift is to change the selection to include all cells from A to B
   // The effect of Ctrl is to add (or remove) only one cell to the selection.

   whenCellFocus(cell: Cell, _event: React.FocusEvent) {
      // console.debug("focus", cell.id)
      const ctrlMultiselect = keysPressed.has('Control') && !keysPressed.has('Tab')
      if (!ctrlMultiselect) {
         this.cellsSelected.clear()
      }

      this.cellsSelected.add(cell.id)
      this.selectionStatus = true
      this.syncSelectionStatus()
   }

   whenCellBlur(cell: Cell, event: React.FocusEvent) {
      // console.debug("blur", cell.id)
      // When <kbd>Escape</kbd> blurs a cell, the selection could be empty
      // in which case, do nothing
      if (this.selectionStatus === null) {
         return
      }
      
      const toAnotherElement = this.isCellElement(event.relatedTarget)
      const ctrlMultiselect = keysPressed.has('Control') && !keysPressed.has('Tab')

      if (toAnotherElement) {
         if (!ctrlMultiselect) {
            this.cellsSelected.delete(cell.id)
         }
         // this.selectionStatus = true
      } else {
         this.selectionStatus = false
      }

      this.syncSelectionStatus()
   }

   /**
    * Keyboard controls as described by https://w3c.github.io/aria-practices/#grid
    * TODO: https://www.w3.org/TR/wai-aria-practices-1.1/#kbd_roving_tabindex
    * Edit: I'm not sure if I should actually follow that section
    */
   whenCellKeydown(targetCell: Cell, event: React.KeyboardEvent) {
      // console.debug("keyboard", targetCell.id, event.repeat, event.key)
      // Use default behavior when tabbing
      if (event.key === 'Tab') {
         return
      }

      event.preventDefault()

      // It is possible that "keysPressed" has not been updated yet. It will be added.
      // This has no effect on the listeners. SAFETY
      keysPressed.add(event.key)

      // Let's say the user pressed both Up and Right at basically the same time
      // What the code sees: Up, Right, UpEnd, RightEnd
      // What the code does: Up, Up+Right
      // We will only consider other keys to repeat when a repeat event occurs
      const keysToProcess = event.repeat ? keysPressed : [event.key]

      const newSelected = new Set<CellID>()

      const target = event.target as HTMLDivElement
      const shiftHeld = keysPressed.has('Shift')
      const ctrlHeld = keysPressed.has('Control')

      // Copy/save previous cells selected, since it changes during the loop
      for (let {row, column} of [...this.cellsSelected]) {
         let cell = this.props.sudoku.cells[row][column]
         const wasTarget = cell === targetCell

         for (const key of keysToProcess) {
            if (cell == null) {
               break
            }

            // Candidate changes
            if ('123456789'.includes(key)) {
               const candidate = Number(key) as SudokuDigits
               cell.toggleCandidate(candidate)
            } else if (['Backspace', 'Delete', 'Clear'].includes(key)) {
               if (shiftHeld || ctrlHeld) {
                  cell.setState({
                     candidates: [],
                     error: true
                  })
               } else {
                  cell.setState({
                     candidates: [1, 2, 3, 4, 5, 6, 7, 8, 9],
                     error: false,
                     pretend: true
                  })
               }
            } else if (key === 'Escape') {
               this.cellsSelected.clear()
               this.selectionStatus = null
               this.syncSelectionStatus()
               target.blur()
               return
            } else {
               // Keyboard movements
               if (key in keyboardMappings) {
                  const step = keyboardMappings[(key as keyof typeof keyboardMappings)];
         
                  row = (row + 9 + step.vRow) % 9 as IndexToNine
                  column = (column + 9 + step.vColumn) % 9 as IndexToNine
               } else if (key === 'Home') {
                  if (event.ctrlKey) {
                     row = 0
                     column = 0
                  } else {
                     column = 0
                  }
               } else if (key === 'End') {
                  if (event.ctrlKey) {
                     row = 8
                     column = 8
                  } else {
                     column = 8
                  }
               } else if (key === 'PageUp' && row !== 0) {
                  row = Math.max(row - 3, 0) as IndexToNine
               } else if (key === 'PageDown' && row !== 8) {
                  row = Math.min(row + 3, 8) as IndexToNine
               }

               // If row and column changed, update to match, otherwise do nothing
               // Reduces code duplication
               cell = this.props.sudoku.cells[row][column]
            }
         }

         // Due to keyboard movements, the original location may have moved to a new location.
         // This new location is reflected by row and column
         this.focusIfTargetMovedAndAddToSelection(row, column, wasTarget && cell !== targetCell, newSelected)
      }

      this.cellsSelected = newSelected
      this.syncSelectionStatus()
   }
}
