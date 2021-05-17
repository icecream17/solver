
import React from 'react';
import Candidate from './Candidate';

type CandidatesProps = Readonly<{
   data: number[]
} & typeof React.Component.prototype.props>

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
      if (!("data" in props)) {
         throw TypeError('Candidates: Required property "data" is missing')
      }

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

   hasCandidate (number: number): boolean {
      return this.props.data.includes(number)
   }

   render() {
      const content = (number: number) => {
         if (this.hasCandidate(number)) {
            return number
         } else {
            return <></>
         }
      }

      return (
         <table className="Candidates">
            <tbody>
               <tr>
                  <Candidate index={0} children={content(1)} />
                  <Candidate index={1} children={content(2)} />
                  <Candidate index={2} children={content(3)} />
               </tr>
               <tr>
                  <Candidate index={3} children={content(4)} />
                  <Candidate index={4} children={content(5)} />
                  <Candidate index={5} children={content(6)} />
               </tr>
               <tr>
                  <Candidate index={6} children={content(7)} />
                  <Candidate index={7} children={content(8)} />
                  <Candidate index={8} children={content(9)} />
               </tr>
            </tbody>
         </table>
      )
   }
}
