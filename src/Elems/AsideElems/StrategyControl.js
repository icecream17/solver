import React from 'react';

/**
 * Controls strategies
 */
export default class StrategyControl extends React.Component {
   constructor(props) {
      super(props)

      for (const requiredProperty of ["callback", "name"]) {
         if (!(requiredProperty in props)) {
            throw TypeError(
               `StrategyControl: Required property "${requiredProperty}" is missing`)
         }
      }
   }

   render() {
      return (
         <button
            className='StrategyControl'
            type='button'
            onClick={this.props.callback}
         >{this.props.name}</button>
      )
   }
}
