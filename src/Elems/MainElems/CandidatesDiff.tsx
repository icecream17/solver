
import React from 'react';
import { SudokuDigits } from '../../Types';
import Candidate from './Candidate';
import { _content } from './Candidates';

type CandidatesDiffProps = Readonly<{
   previous: SudokuDigits[] | null
   current: SudokuDigits[]
   classes: string[] | null
}>

/**
 * Based on `Candidates`,
 * This adds css classes for any removed or added candidates.
 *
 * The css classes actually have precedence over the classes defined by strategies
 */
export default class CandidatesDiff extends React.Component<CandidatesDiffProps> {
   constructor(props: CandidatesDiffProps) {
      super(props)

      this.hadCandidate = this.hadCandidate.bind(this)
      this.hasCandidate = this.hasCandidate.bind(this)
   }

   hadCandidate(candidate: SudokuDigits): boolean {
      if (this.props.previous === null) {
         return this.props.current.includes(candidate)
      }
      return this.props.previous.includes(candidate)
   }

   hasCandidate(candidate: SudokuDigits): boolean {
      return this.props.current.includes(candidate)
   }

   render() {
      return (
         <table className="Candidates">
            <tbody>
               <tr>
                  <Candidate index={0} className={this._color(1)}>{_content(this, 1)}</Candidate>
                  <Candidate index={1} className={this._color(2)}>{_content(this, 2)}</Candidate>
                  <Candidate index={2} className={this._color(3)}>{_content(this, 3)}</Candidate>
               </tr>
               <tr>
                  <Candidate index={3} className={this._color(4)}>{_content(this, 4)}</Candidate>
                  <Candidate index={4} className={this._color(5)}>{_content(this, 5)}</Candidate>
                  <Candidate index={5} className={this._color(6)}>{_content(this, 6)}</Candidate>
               </tr>
               <tr>
                  <Candidate index={6} className={this._color(7)}>{_content(this, 7)}</Candidate>
                  <Candidate index={7} className={this._color(8)}>{_content(this, 8)}</Candidate>
                  <Candidate index={8} className={this._color(9)}>{_content(this, 9)}</Candidate>
               </tr>
            </tbody>
         </table>
      )
   }

   /** Adds a css class for any new or deleted candidates */
   _color (candidate: SudokuDigits) {
      if (this.hasCandidate(candidate) === this.hadCandidate(candidate)) {
         return this.props.classes?.[candidate - 1] ?? ""
      }

      return (
         this.hasCandidate(candidate)
            ? "added"
            : "eliminated"
      )
   }
}
