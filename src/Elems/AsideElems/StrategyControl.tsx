import React from 'react';

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
      for (const requiredProperty of ["onClick", "name"] as const) {
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
