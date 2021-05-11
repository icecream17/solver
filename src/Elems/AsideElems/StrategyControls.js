import React from 'react';
import StrategyControl from './StrategyControl';

/**
 * A bunch of strategy controls [TODO]
 *
 * @requiredProps
 * - solver: Solver
 */
export default class StrategyControls extends React.Component {
   constructor(props) {
      for (const requiredProperty of ["solver"]) {
         if (!(requiredProperty in props)) {
            throw TypeError(`StrategyControls: Required property "${requiredProperty}" is missing`)
         }
      }

      super(props)
   }

   render() {
      return (
         <fieldset className='StrategyControls'>
            <legend>controls (todo)</legend>
            <StrategyControl onClick={this.props.solver.Go} name="go" />
            <StrategyControl onClick={this.props.solver.Step} name="step" />
            <StrategyControl onClick={this.props.solver.Undo} name="undo" />
         </fieldset>
      )
   }
}
