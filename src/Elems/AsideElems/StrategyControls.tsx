import React from 'react';
import Solver from '../../Api/Solver';
import { GuaranteedConstructCallback } from '../../Types';
import StrategyControl from './StrategyControl';

type StrategyControlsProps = {
   solver: Solver
} & GuaranteedConstructCallback

/**
 * A bunch of strategy controls [TODO]
 *
 * @requiredProps
 * - solver: Solver
 */
export default class StrategyControls extends React.Component<StrategyControlsProps> {
   constructor(props: StrategyControlsProps) {
      for (const requiredProperty of ["solver"] as const) {
         if (!(requiredProperty in props)) {
            throw TypeError(`StrategyControls: Required property "${requiredProperty}" is missing`)
         }
      }

      super(props)
      this.props.whenConstruct(this)
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
