
import React from 'react';

/**
 * Turns a strategy off or on
 */
export default class StrategyToggler extends React.Component {
   constructor(props) {
      super(props)

      for (const requiredProperty of ["callback"]) {
         if (!(requiredProperty in props)) {
            throw TypeError(`StrategyToggler: Required prop.state "${requiredProperty}" is missing`)
         }
      }

      this.state = {
         checked: true
      }
   }

   render() {
      return (
         <input
            className="StrategyToggler"
            type="checkbox"
            aria-label="toggle strategy"
            role="switch"
            onChange={this.callback.bind(this)}
            aria-checked={String(this.state.checked)}
            checked={this.state.checked ? 'checked' : ''}
         />
      )
   }

   callback() {
      this.setState(state => ({ checked: !state.checked }))
      this.props.callback()
   }
}
