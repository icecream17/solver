
import React from 'react';

/**
 * A candidate
 */
export default class Candidate extends React.Component {
   constructor(props) {
      super(props)

      for (const requiredProperty of ["index", "children"]) {
         if (!(requiredProperty in props)) {
            throw TypeError(`Candidate: Required property "${requiredProperty}" is missing`)
         }
      }

      if (typeof props.index !== "number") {
         throw TypeError('Candidate: "index" is not an number')
      }
   }

   render() {
      return (
         <td
            className="Candidate"
            index={this.props.index}
         >{this.props.children}</td>
      )
   }
}
