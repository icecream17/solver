
import React from 'react';
import Candidates from './Candidates';

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
export default class SetCandidates extends React.Component {
   constructor(props) {
      super(props)

      if (!("data" in props)) {
         throw TypeError('SetCandidates: Required property "data" is missing')
      }

      if (!Array.isArray(props.data)) {
         throw TypeError('SetCandidates: "data" is not an array')
      }
   }

   /** How many candidates are left */
   get numCandidates() {
      return this.state.candidates.length
   }

   render() {
      return (
         <Candidates data={this.props.data} onKeyPress={this.processKeypress.bind(this)} />
      )
   }

   processKeypress(event) {
      if (event.key === 'Backspace') {
         this.setState(state => ({ candidates: [] }))
      } else if ('123456789'.includes(event.key)) {
         this.setState(state => {
            if (state.includes(Number(event.key))) {
               return state
            } else {
               return [...state, Number(event.key)]
            }
         })
      }
   }
}
