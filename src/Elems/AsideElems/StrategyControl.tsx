import React from 'react';
import _expect from '../../expectProps';

type StrategyControlProps = Readonly<{
   onClick: React.MouseEventHandler,
   name: typeof React.Component.prototype.props.children
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
