
import './Candidate.css'
import React from 'react';
import { IndexToNine } from '../../Types';

type CandidateProps = Readonly<{
   index: IndexToNine
   className?: string
   children?: React.ReactNode
}>

/**
 * A cell candidate
 */
export default class Candidate extends React.PureComponent<CandidateProps> {
   render() {
      let thisClassName = "Candidate"
      if (typeof this.props.children === "string" || typeof this.props.children === "number") {
         thisClassName += ` digit-${Number(this.props.index) + 1}`
      }

      if (this.props.className) {
         thisClassName += ` ${this.props.className}`
      }

      const label =
         this.props.className?.split(/\s+/).includes("added") ? "added candidate" :
         this.props.className?.split(/\s+/).includes("eliminated") ? "eliminated candidate" : "candidate"

      return (
         <span
            className={thisClassName}
            data-index={this.props.index}
            aria-label={label}
         >{this.props.children}</span>
      )
   }
}
