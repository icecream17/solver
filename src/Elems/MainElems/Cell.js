
import React from 'react';

import Candidates from './Candidates';
import SetCandidates from './SetCandidates';

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
         /** An array of possible candidates. Starts at [1, 2, 3, 4, 5, 6, 7, 8, 9] */
         candidates: [1, 2, 3, 4, 5, 6, 7, 8, 9],
         showCandidates: false,
         error: false, /** Whether the candidates array is empty */
         active: false
      }

      this.props.callback(this) /** See sudoku.js */
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
            onFocus={this.whenFocus.bind(this)}
            onBlur={this.whenBlur.bind(this)}
            onKeyDown={this.processKeyDown.bind(this)}
         >{content}</td>
      )
   }

   whenFocus(_event) {
      this.setState({ active: true, showCandidates: true })
   }

   whenBlur(_event) {
      this.setState(state => {
         const showCandidates = state.candidates.length !== 0
         return { active: false, showCandidates }
      })
   }

   /**
    * Handler for "keyDown" events
    * Not handling "keypress" since that's deprecated.
    */
   processKeyDown(event) {
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
      }
   }
}
