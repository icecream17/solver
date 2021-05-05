
import React from 'react';

/**
 * How did trying the strategy go?
 */
export default class StrategyStatus extends React.Component {
   constructor(props) {
      super(props)

      for (const requiredProperty of ["success", "successcount"]) {
         if (!(requiredProperty in props.state)) {
            throw TypeError(`StrategyLabel: Required prop.state "${requiredProperty}" is missing`)
         }
      }

      this.state = {...this.props.state}
   }

   render() {
      const resultText = (
         this.state.success === null
            ? '-'
            : this.state.success
               ? this.successcount === 1
                  ? 'Yes'
                  : this.successcount > 1
                     ? this.successcount
                     : 'Error!'
               : 'No'
      )

      const cssClass = (
         this.state.success === null
            ? 'null'
            : this.state.success
               ? 'success'
               : 'fail'
      )

      return (
         <span className={`StrategyResult ${cssClass}`}>
            {resultText}
         </span>
      )
   }
}
