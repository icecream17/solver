
import React from 'react';
import { _expect } from '../../utils';
import { IndexToNine, _ReactProps } from '../../Types';

type CandidateProps = Readonly<{
   index: IndexToNine
}> & _ReactProps

/**
 * A cell candidate
 *
 * @requiredProps
 * - index: number
 * - children
 */
export default class Candidate extends React.Component<CandidateProps> {
   constructor(props: CandidateProps) {
      _expect(Candidate, props).toHaveProperty("index")

      if (typeof props.index !== "number") {
         throw TypeError('Candidate: "index" is not an number')
      }

      super(props)
   }

   render() {
      let thisClassName = 'Candidate'
      if ((this.props.children ?? "").length !== 0) {
         thisClassName += ` digit-${this.props.index}`
      }

      return (
         <td
            className={thisClassName}
            data-index={this.props.index}
         >{this.props.children}</td>
      )
   }
}
