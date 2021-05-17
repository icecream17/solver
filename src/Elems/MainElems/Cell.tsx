
import React from 'react';
import { HasWhenConstruct, IndexToNine, PossibleConstructCallback, SudokuDigits } from '../../Types';

import Candidates from './Candidates';
import Sudoku from './Sudoku';

// Maps keys to coords
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

type CellProps = PossibleConstructCallback & Readonly<{
   row: IndexToNine,
   column: IndexToNine,
   sudoku: Sudoku
}>

type CellState = Readonly<{
   candidates: SudokuDigits[],
   showCandidates: boolean,
   error: boolean,
   active: boolean
}>


/**
 * A cell in a sudoku
 *
 * Requires a "row" and "column" property
 *
 * In state
 * - candidates
 * - showCandidates
 * - error
 *
 * @example
 * <Cell row={1} column={4} />
 *
 * @requiredProps
 * - row
 * - column
 */
export default class Cell extends React.Component<CellProps, CellState> {
   constructor(props: CellProps) {
      for (const requiredProperty of ["row", "column", "sudoku"] as const) {
         if (!(requiredProperty in props)) {
            throw TypeError(`Cell: Required property "${requiredProperty}" is missing`)
         }
      }

      super(props)

      this.state = {
         /** An array of possible candidates.
           * Starts at [1, 2, 3, 4, 5, 6, 7, 8, 9] and updates in `whenKeyDown`
           */
         candidates: [1, 2, 3, 4, 5, 6, 7, 8, 9],

         /** Whether to show candidates
           *
           * This has no effect when there's 0 or 1 candidates -
           * in those cases only a single digit is shown: 0 || 1 to 9
           *
           * `whenFocus` sets this to true
           * `whenBlur` sets this to true when 1 < candidates < 9
           * `shift+backspace` sets this to false
           */
         showCandidates: false,

         /** Whether the candidates array is empty */
         error: false,

         /** If this is currently focused by the user - set by whenFocus and whenBlur */
         active: false
      }

      /** See sudoku.js - this if statement is anticipating future code changes */
      if (HasWhenConstruct(this.props)) {
         this.props.whenConstruct(this)
      } else {
         console.warn("Remove useless code in Cell.js")
      }

      this.whenFocus = this.whenFocus.bind(this)
      this.whenBlur = this.whenBlur.bind(this)
      this.whenKeyDown = this.whenKeyDown.bind(this)
   }

   /** How many candidates are left */
   get numCandidates() {
      return this.state.candidates.length
   }

   render() {
      let content = <></>;

      // Using a span for the digits
      // so that I can force cells to always be [css height: 1/9th]
      if (this.state.active) {
         content = <Candidates data={this.state.candidates} />
      } else if (this.numCandidates === 0) {
         content = <span className="ugh tables"> 0 </span>
      } else if (this.numCandidates === 1) {
         content = <span className="ugh tables"> {this.state.candidates[0]} </span>
      } else if (this.state.showCandidates) {
         // numCandidates > 1
         content = <Candidates data={this.state.candidates} />
      }

      // 1. inner div to separate aria roles
      //    and because <button> elements cannot contain tables
      // 2. tabIndex for focusability
      //    ="0" because of a11y thing
      return (
         <td className='Cell'>
            <div
               className='Cell'
               role='button'
               aria-label={`Cell at row ${this.props.row}, column ${this.props.column}`}
               data-error={this.state.error ? "true" : undefined}
               data-active={this.state.active ? "true" : undefined}
               tabIndex={0}
               onFocus={this.whenFocus}
               onBlur={this.whenBlur}
               onKeyDown={this.whenKeyDown}
            >{content}</div>
         </td>
      )
   }

   whenFocus(_event: React.FocusEvent) {
      this.setState({ active: true, showCandidates: true })
   }

   whenBlur(_event: React.FocusEvent) {
      this.setState((state: CellState): CellState => {
         if (1 < state.candidates.length && state.candidates.length < 9) {
            return { active: false, showCandidates: true } as CellState
         }
         return { active: false } as CellState
      })
   }

   /**
    * Handler for "keyDown" events
    * Not handling "keypress" since that's deprecated.
    *
    * When a digit is pressed: "123456789",
    * then it toggles that candidate.
    *
    * Shift+Backspace resets the candidates
    * Backspace deletes the candidates
    *
    * "Undocumented": The `delete` and `clear` keys also work
    */
   whenKeyDown(event: React.KeyboardEvent) {
      const target = event.target as HTMLTableDataCellElement
      if ('123456789'.includes(event.key)) {
         const candidate = Number(event.key) as SudokuDigits

         this.setState((state: CellState) => {
            const candidates = new Set(state.candidates)
            const dataElement = document.getElementById('Data') as HTMLTextAreaElement

            if (candidates.has(candidate)) {
               candidates.delete(candidate)
            } else {
               candidates.add(candidate)
            }

            if (candidates.size === 0) {
               dataElement.value = "empty!"
               return {
                  candidates: [],
                  error: true
               }
            }

            dataElement.value = [...candidates].join('')
            return {
               candidates: [...candidates],
               error: false
            }
         })
      } else if (['Backspace', 'Delete', 'Clear'].includes(event.key)) {
         const dataElement = document.getElementById('Data') as HTMLTextAreaElement
         if (event.shiftKey) {
            this.setState({
               candidates: [1, 2, 3, 4, 5, 6, 7, 8, 9],
               showCandidates: false,
               error: false
            })
            dataElement.value = '123456789'
         } else {
            this.setState({
               candidates: [],
               error: true
            })
            dataElement.value = 'Empty!'
         }
      } else if (event.key in keyboardMappings) {
         const step = keyboardMappings[(event.key as keyof typeof keyboardMappings)]

         // blur this and focus the other cell
         target.blur()
         this.props.sudoku.focusCell(
            (this.props.row + 9 + step.vRow) % 9 as IndexToNine,
            (this.props.column + 9 + step.vColumn) % 9 as IndexToNine
         )
      } else if (event.key === 'Escape') {
         target.blur()
      }
   }
}
