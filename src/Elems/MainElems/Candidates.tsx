
import "./Candidates.css"
import React from 'react';
import { IndexToNine, SudokuDigits } from '../../Types';
import Candidate from './Candidate';

type CandidatesProps = Readonly<{
   /**
    * The actual array of candidates
    */
   data: SudokuDigits[]

   /**
    * The classes added to each candidate (see {@link Cell#candidateClasses})
    */
   classes: string[] | null
}>

type ThisHasCandidate = { hasCandidate (candidate: SudokuDigits): boolean }
export function _content (self: ThisHasCandidate, candidate: SudokuDigits) {
   return (
      self.hasCandidate(candidate)
         ? candidate
         : <></>
   )
}

/**
 * The candidates of a cell
 * Candidates are the possible digits of a cell.
 *
 * Be sure to update CandidatesDiff as well!
 * TODO: Use grid since in this case data is not tabular
 */
export default class Candidates extends React.Component<CandidatesProps> {
   constructor(props: CandidatesProps) {
      super(props)
      this.hasCandidate = this.hasCandidate.bind(this)
   }

   hasCandidate (candidate: SudokuDigits): boolean {
      return this.props.data.includes(candidate)
   }

   render() {
      return (
         <table className="Candidates">
            <tbody>
               <tr>
                  <Candidate {...this.repeatedProps(0)}>{_content(this, 1)}</Candidate>
                  <Candidate {...this.repeatedProps(1)}>{_content(this, 2)}</Candidate>
                  <Candidate {...this.repeatedProps(2)}>{_content(this, 3)}</Candidate>
               </tr>
               <tr>
                  <Candidate {...this.repeatedProps(3)}>{_content(this, 4)}</Candidate>
                  <Candidate {...this.repeatedProps(4)}>{_content(this, 5)}</Candidate>
                  <Candidate {...this.repeatedProps(5)}>{_content(this, 6)}</Candidate>
               </tr>
               <tr>
                  <Candidate {...this.repeatedProps(6)}>{_content(this, 7)}</Candidate>
                  <Candidate {...this.repeatedProps(7)}>{_content(this, 8)}</Candidate>
                  <Candidate {...this.repeatedProps(8)}>{_content(this, 9)}</Candidate>
               </tr>
            </tbody>
         </table>
      )
   }

   repeatedProps(index: IndexToNine) {
      return {
         index,
         className: this.props.classes?.[index] ?? ''
      } as const
   }
}
