
import React from 'react';

import Candidates from './Candidates';
import SetCandidates from './SetCandidates';

// Maps keys to coords - Object.assign prevents prototype pollution
const keyboardMappings = Object.assign(Object.create(null), {
   'ArrowUp': {vRow: 0, vColumn: -1},
   'KeyW': {vRow: 0, vColumn: -1},
   'ArrowLeft': {vRow: -1, vColumn: 0},
   'KeyA': {vRow: -1, vColumn: 0},
   'ArrowDown': {vRow: 0, vColumn: 1},
   'KeyS': {vRow: 0, vColumn: 1},
   'ArrowRight': {vRow: 1, vColumn: 0},
   'KeyD': {vRow: 1, vColumn: 0},
})

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
 */
export default class Cell extends React.Component {
   constructor(props) {
      super(props)

      for (const requiredProperty of ["row", "column", "callback"]) {
         if (!(requiredProperty in props)) {
            throw TypeError(`Cell: Required property "${requiredProperty}" is missing`)
         }
      }

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

      this.props.callback(this) /** See sudoku.js */
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
         content = <SetCandidates data={this.state.candidates} />
      } else if (this.numCandidates === 0) {
         content = <span className="ugh tables"> 0 </span>
      } else if (this.numCandidates === 1) {
         content = <span className="ugh tables"> {this.state.candidates[0]} </span>
      } else if (this.state.showCandidates) {
         // numCandidates > 1
         content = <Candidates data={this.state.candidates} />
      }

      // tabIndex for focusability
      // ="0" because of a11y thing
      return (
         <td
            className='Cell'
            data-error={this.state.error ? "true" : undefined}
            active={this.state.active ? "true" : undefined}
            tabIndex="0"
            onFocus={this.whenFocus}
            onBlur={this.whenBlur}
            onKeyDown={this.whenKeyDown}
         >{content}</td>
      )
   }

   whenFocus(_event) {
      this.setState({ active: true, showCandidates: true })
   }

   whenBlur(_event) {
      this.setState(state => {
         if (1 < state.candidates.length && state.candidates.length < 9) {
            return { active: false, showCandidates: true }
         }
         return { active: false }
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
   whenKeyDown(event) {
      if ('123456789'.includes(event.key)) {
         const candidate = Number(event.key)

         this.setState(state => {
            const candidates = new Set(state.candidates)

            if (candidates.has(candidate)) {
               candidates.delete(candidate)
            } else {
               candidates.add(candidate)
            }

            if (candidates.size === 0) {
               document.getElementById('Data').value = "empty!"
               return {
                  candidates: [],
                  error: true
               }
            }

            document.getElementById('Data').value = [...candidates].join('')
            return {
               candidates: [...candidates],
               error: false
            }
         })
      } else if (['Backspace', 'Delete', 'Clear'].includes(event.key)) {
         if (event.shiftKey) {
            this.setState({
               candidates: [1, 2, 3, 4, 5, 6, 7, 8, 9],
               showCandidates: false,
               error: false
            })
            document.getElementById('Data').value = '123456789'
         } else {
            this.setState({
               candidates: [],
               error: true
            })
            document.getElementById('Data').value = 'Empty!'
         }
      } else if (event.key in keyboardMappings) {
         // = tbody
         const sudokuElement = event.target.parentElement.parentElement
         const step = keyboardMappings[event.key]

         // blur this and focus the other cell
         event.target.blur()
         sudokuElement.children[(this.row + 9 + step.vRow) % 9]
                      .children[(this.column + 9 + step.vColumn) % 9].focus()
      } else if (event.key === 'Escape') {
         // const sudokuElement = event.target.parentElement.parentElement
         event.target.blur()
         // TODO: Focus something else?
      }
   }
}
