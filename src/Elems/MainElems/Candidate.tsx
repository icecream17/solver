
import './Candidate.css'
import React from 'react';
import { IndexToNine, _ReactProps } from '../../Types';

type CandidateProps = Readonly<{
   index: IndexToNine
   className?: string
}> & _ReactProps

/**
 * A cell candidate
 */
export default class Candidate extends React.Component<CandidateProps> {
   render() {
      let thisClassName = "Candidate"
      if (typeof this.props.children === "string" || typeof this.props.children === "number") {
         thisClassName += ` digit-${Number(this.props.index) + 1}`
      }

      if (this.props.className) {
         thisClassName += ` ${this.props.className}`
      }

      return (
         <td
            className={thisClassName}
            data-index={this.props.index}
         >{this.props.children}</td>
      )
   }
}
