
import React from 'react';
import { _expect } from '../../utils';
import { SudokuDigits, _ReactProps } from '../../Types';
import Candidate from './Candidate';

type CandidatesProps = Readonly<{
   data: SudokuDigits[]
}> & _ReactProps

/**
 * The candidates of a cell
 * Candidates are the possible digits of a cell.
 *
 * Be sure to update SetCandidates as well!
 *
 * @requiredProps
 * - data: Array<any>
 */
export default class Candidates extends React.Component<CandidatesProps> {
   constructor(props: CandidatesProps) {
      _expect(Candidates, props).toHaveProperty("data")

      if (!Array.isArray(props.data)) {
         throw TypeError('Candidates: "data" is not an array')
      }

      super(props)

      this.hasCandidate = this.hasCandidate.bind(this)
   }


   /** How many candidates are left */
   get numCandidates(): number {
      return this.props.data.length
   }

   hasCandidate (candidate: SudokuDigits): boolean {
      return this.props.data.includes(candidate)
   }

   render() {
      const content = (candidate: SudokuDigits) => {
         if (this.hasCandidate(candidate)) {
            return candidate
         } else {
            return <></>
         }
      }

      return (
         <table className="Candidates">
            <tbody>
               <tr>
                  <Candidate index={0}>{content(1)}</Candidate>
                  <Candidate index={1}>{content(2)}</Candidate>
                  <Candidate index={2}>{content(3)}</Candidate>
               </tr>
               <tr>
                  <Candidate index={3}>{content(4)}</Candidate>
                  <Candidate index={4}>{content(5)}</Candidate>
                  <Candidate index={5}>{content(6)}</Candidate>
               </tr>
               <tr>
                  <Candidate index={6}>{content(7)}</Candidate>
                  <Candidate index={7}>{content(8)}</Candidate>
                  <Candidate index={8}>{content(9)}</Candidate>
               </tr>
            </tbody>
         </table>
      )
   }
}
