
import './CandidatesDiff.css'
import React from 'react';
import { _expect } from '../../utils';
import { SudokuDigits, _ReactProps } from '../../Types';
import Candidate from './Candidate';

type CandidatesDiffProps = Readonly<{
   previous: SudokuDigits[] | null
   current: SudokuDigits[]
   classes: string[] | null
}> & _ReactProps

/**
 * Based off of `Candidates`,
 * This adds css classes to show if one or more candidates were added or removed
 *
 * The css classes actually have precedence over the classes defined by strategies
 *
 * @requiredProps
 * - previous
 * - current
 * - classes
 */
export default class CandidatesDiff extends React.Component<CandidatesDiffProps> {
   constructor(props: CandidatesDiffProps) {
      _expect(CandidatesDiff, props).toHaveProperties("previous", "current", "classes")

      if (!Array.isArray(props.previous) && props.previous !== null) {
         throw TypeError('CandidatesDiff: "previous" is not an array')
      }

      if (!Array.isArray(props.current)) {
         throw TypeError('CandidatesDiff: "current" is not an array')
      }

      super(props)

      this.hadCandidate = this.hadCandidate.bind(this)
      this.hasCandidate = this.hasCandidate.bind(this)
   }


   /** How many candidates are left */
   get numCandidates(): number {
      return this.props.current.length
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
      const content = (candidate: SudokuDigits) => {
         if (this.hasCandidate(candidate)) {
            return candidate
         } else {
            return <></>
         }
      }

      const color = (candidate: SudokuDigits) => {
         if (this.hasCandidate(candidate) !== this.hadCandidate(candidate)) {
            if (this.hasCandidate(candidate)) {
               return "added" // Candidate now added
            } else {
               return "eliminated" // Candidate now removed
            }
         } else {
            return this.props.classes?.[candidate] ?? ""
         }
      }

      return (
         <table className="Candidates">
            <tbody>
               <tr>
                  <Candidate index={0} className={color(1)}>{content(1)}</Candidate>
                  <Candidate index={1} className={color(2)}>{content(2)}</Candidate>
                  <Candidate index={2} className={color(3)}>{content(3)}</Candidate>
               </tr>
               <tr>
                  <Candidate index={3} className={color(4)}>{content(4)}</Candidate>
                  <Candidate index={4} className={color(5)}>{content(5)}</Candidate>
                  <Candidate index={5} className={color(6)}>{content(6)}</Candidate>
               </tr>
               <tr>
                  <Candidate index={6} className={color(7)}>{content(7)}</Candidate>
                  <Candidate index={7} className={color(8)}>{content(8)}</Candidate>
                  <Candidate index={8} className={color(9)}>{content(9)}</Candidate>
               </tr>
            </tbody>
         </table>
      )
   }
}
