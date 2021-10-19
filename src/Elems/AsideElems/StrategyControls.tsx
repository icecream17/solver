import React from 'react';
import "./StrategyControls.css"

import Solver from '../../Api/Solver';
import { GuaranteedConstructCallback } from '../../Types';
import Control from '../Control';
import StrategyControl from './StrategyControl';

type StrategyControlsProps = Readonly<{
   solver: Solver
}> & GuaranteedConstructCallback

/**
 * A bunch of strategy controls [TODO]
 */
export default class StrategyControls extends React.Component<StrategyControlsProps> {
   constructor(props: StrategyControlsProps) {
      super(props)
      this.props.whenConstruct(this)
   }

   render() {
      return (
         <fieldset className='StrategyControls'>
            <legend>controls</legend>
            <Control onClick={this.props.solver.Clear} name="clear" />
            <Control onClick={this.props.solver.Import} name="import" />
            <Control onClick={this.props.solver.Export} name="export" />
            <StrategyControl onClick={this.props.solver.Go} name="go" />
            <StrategyControl onClick={this.props.solver.Step} name="step" />
            <StrategyControl onClick={this.props.solver.Undo} name="undo" />
         </fieldset>
      )
   }
}
