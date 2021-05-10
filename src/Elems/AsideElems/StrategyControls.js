import React from 'react';
import StrategyControl from './StrategyControl';

/**
 * A bunch of strategy controls [TODO]
 * @requiredProps
 * - solver: Solver
 */
export default class StrategyControls extends React.Component {
   render() {
      return (
         <fieldset className='StrategyControls'>
            <legend>controls (todo)</legend>
            <StrategyControl onClick={this.props.solver.Run} name="run" />
            <StrategyControl onClick={this.props.solver.Step} name="step" />
            <StrategyControl onClick={this.props.solver.Undo} name="undo" />
         </fieldset>
      )
   }
}
