import React from 'react';

/**
 * Controls strategies
 */
export default class StrategyControl extends React.Component {
   constructor(props) {
      for (const requiredProperty of ["onClick", "name"]) {
         if (!(requiredProperty in props)) {
            throw TypeError(
               `StrategyControl: Required property "${requiredProperty}" is missing`)
         }
      }

      super(props)
   }

   render() {
      return (
         <button
            className='StrategyControl'
            type='button'
            onClick={this.props.onClick}
         >{this.props.name}</button>
      )
   }
}
