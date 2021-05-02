
import React from 'react';
import Candidate from './Candidate';

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
export default class Candidates extends React.Component {
   constructor(props) {
      super(props)

      if (!("data" in props)) {
         throw TypeError('Candidates: Required property "data" is missing')
      }

      if (!Array.isArray(props.data)) {
         throw TypeError('Candidates: "data" is not an array')
      }

      this.state = {
         candidates: this.props.data
      }

      this.hasCandidate = this.hasCandidate.bind(this)
   }

   get candidates() {
      return this.state.candidates
   }

   /** How many candidates are left */
   get numCandidates() {
      return this.state.candidates.length
   }

   hasCandidate (number) {
      return this.state.candidates.includes(number)
   }

   render() {
      function content (number) {
         if (this.hasCandidate.call(this, number)) {
            return number
         } else {
            return <></>
         }
      }

      // eslint-disable-next-line no-func-assign
      content = content.bind(this)

      return (
         <table className="Candidates">
            <tbody>
               <tr>
                  <Candidate index={1} children={content(1)} />
                  <Candidate index={2} children={content(2)} />
                  <Candidate index={3} children={content(3)} />
               </tr>
               <tr>
                  <Candidate index={4} children={content(4)} />
                  <Candidate index={5} children={content(5)} />
                  <Candidate index={6} children={content(6)} />
               </tr>
               <tr>
                  <Candidate index={7} children={content(7)} />
                  <Candidate index={8} children={content(8)} />
                  <Candidate index={9} children={content(9)} />
               </tr>
            </tbody>
         </table>
      )
   }
}
