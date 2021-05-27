import React from 'react';
import { _expect } from '../../utils';
import { _ReactProps } from '../../Types';

type StrategyControlProps = Readonly<{
   onClick: React.MouseEventHandler,
   name: _ReactProps["children"]
}>

/**
 * Strategy control
 * When a user clicks on the control... something happens,
 * like a strategy being run against the sudoku.
 *
 * @requiredProps
 * - onClick
 * - name
 */
export default class StrategyControl extends React.Component<StrategyControlProps> {
   constructor(props: StrategyControlProps) {
      _expect(StrategyControl, props).toHaveProperties("onClick", "name")

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
