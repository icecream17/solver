import React from 'react';
import Control from '../Control';

type StrategyControlProps = Readonly<{
   onClick: React.MouseEventHandler,
   name: string
}>

/**
 * Strategy control
 * Useless - there's "Control". Don't know why this exists.
 */
export default class StrategyControl extends React.Component<StrategyControlProps> {
   render() {
      return (
         <Control
            className='StrategyControl'
            onClick={this.props.onClick}
            name={this.props.name}
         />
      )
   }
}
