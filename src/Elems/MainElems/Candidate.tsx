
import React from 'react';
import _expect from '../../expectProps';
import { IndexToNine } from '../../Types';

type CandidateProps = Readonly<{
   index: IndexToNine
} & typeof React.Component.prototype.props>

/**
 * A cell candidate
 *
 * @requiredProps
 * - index: number
 * - children
 */
export default class Candidate extends React.Component<CandidateProps> {
   constructor(props: CandidateProps) {
      _expect(Candidate, props).toHaveProperties("index", "children")

      if (typeof props.index !== "number") {
         throw TypeError('Candidate: "index" is not an number')
      }

      super(props)
   }

   render() {
      return (
         <td
            className="Candidate"
            data-index={this.props.index}
         >{this.props.children}</td>
      )
   }
}
