import React from 'react';
import { _ReactProps } from '../../Types';
import Control from '../Control';

type StrategyControlProps = Readonly<{
   onClick: React.MouseEventHandler,
   name: _ReactProps["children"]
}>

/**
 * Strategy control
 * When a user clicks on the control... something happens,
 * like a strategy being run against the sudoku.
 */
export default class StrategyControl extends React.Component<StrategyControlProps> {
   render() {
      return (
         <Control
            className='StrategyControl'
            onClick={this.props.onClick}
         >{this.props.name}</Control>
      )
   }
}
