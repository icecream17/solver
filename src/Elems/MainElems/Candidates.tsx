
import React from 'react';
import { _expect } from '../../utils';
import { IndexToNine, SudokuDigits, _ReactProps } from '../../Types';
import Candidate from './Candidate';

type CandidatesProps = Readonly<{
   data: SudokuDigits[]
   classes: string[] | null
}> & _ReactProps

/**
 * The candidates of a cell
 * Candidates are the possible digits of a cell.
 *
 * Be sure to update CandidatesDiff as well!
 *
 * @requiredProps
 * - data
 * - classes
 */
export default class Candidates extends React.Component<CandidatesProps> {
   constructor(props: CandidatesProps) {
      _expect(Candidates, props).toHaveProperties("data", "classes")

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
      let index = 0
      const getRepeatedProps = () => {
         return {
            index: index++ as IndexToNine,
            className: this.props.classes?.[index] ?? ''
         } as const
      }


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
                  <Candidate {...getRepeatedProps()}>{content(1)}</Candidate>
                  <Candidate {...getRepeatedProps()}>{content(2)}</Candidate>
                  <Candidate {...getRepeatedProps()}>{content(3)}</Candidate>
               </tr>
               <tr>
                  <Candidate {...getRepeatedProps()}>{content(4)}</Candidate>
                  <Candidate {...getRepeatedProps()}>{content(5)}</Candidate>
                  <Candidate {...getRepeatedProps()}>{content(6)}</Candidate>
               </tr>
               <tr>
                  <Candidate {...getRepeatedProps()}>{content(7)}</Candidate>
                  <Candidate {...getRepeatedProps()}>{content(8)}</Candidate>
                  <Candidate {...getRepeatedProps()}>{content(9)}</Candidate>
               </tr>
            </tbody>
         </table>
      )
   }
}
