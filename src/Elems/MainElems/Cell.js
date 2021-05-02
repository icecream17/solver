
import React from 'react';

import { getGlobalRef } from '../../globalRef';

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

      for (const requiredProperty of ["row", "column"]) {
         if (!(requiredProperty in props)) {
            throw TypeError(`Cell: Required property "${requiredProperty}" is missing`)
         }
      }

      this.state = {
         /** An array of possible candidates. Starts at [1, 2, 3, 4, 5, 6, 7, 8, 9] */
         candidates: [1, 2, 3, 4, 5, 6, 7, 8, 9],
         showCandidates: false,
         error: false,
         active: false
      }
   }

   /** How many candidates are left */
   get numCandidates() {
      return this.state.candidates.length
   }

   render() {
      let content = <></>;

      if (this.state.active) {
         content = <SetCandidates data={this.state.candidates} />
      } else if (this.numCandidates === 1) {
         content = this.state.candidates[0]
      } else if (this.state.showCandidates) {
         if (this.numCandidates === 0) {
            content = 0
         } else {
            // numCandidates > 1
            content = <Candidates data={this.state.candidates} />
         }
      }

      return (
         <td
            className='Cell'
            error={this.state.error ? "true" : undefined}
            active={this.state.active ? "true" : undefined}
            tabIndex="3"
            onFocus={this.processFocus.bind(this)}
            onBlur={this.processBlur.bind(this)}
            onKeyPress={this.processKeyPress.bind(this)}
         >{content}</td>
      )
   }

   processFocus(_event) {
      this.setState(_state => ({ active: true, showCandidates: true }))
   }

   processBlur(_event) {
      const showCandidates = this.numCandidates !== 0

      this.setState(_state => ({ active: false, showCandidates }))
   }

   processKeyPress(event) {
      if ('123456789'.includes(event.key)) {
         const candidate = Number(event.key)
         const candidates = new Set(this.state.candidates)

         if (candidates.has(candidate)) {
            candidates.delete(candidate)
         } else {
            candidates.add(candidate)
         }

         this.setState(_state => ({ candidates: [...candidates] }))

         getGlobalRef('Data').current.setValue([...candidates].join(''))
      } else if (event.key === 'Backspace') {
         this.setState({ candidates: [] })
      }
   }
}
