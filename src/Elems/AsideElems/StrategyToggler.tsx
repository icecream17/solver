
import React from 'react';
import _expect from '../../expectProps';

type StrategyTogglerProps = Readonly<{
   callback: React.ChangeEventHandler
   id: string
}>

type StrategyTogglerState = Readonly<{
   checked: boolean
}>

/**
 * Turns a strategy off or on
 *
 * @requiredProps
 * - callback
 * - id
 */
export default class StrategyToggler extends React.Component<StrategyTogglerProps, StrategyTogglerState> {
   constructor(props: StrategyTogglerProps) {
      _expect(StrategyToggler, props).toHaveProperties("callback", "id")

      super(props)

      this.state = {
         checked: true
      }
   }

   render() {
      return (
         <input
            className="StrategyToggler"
            id={this.props.id}
            type="checkbox"
            aria-label="toggle strategy"
            role="switch"
            onChange={this.callback.bind(this)}
            aria-checked={this.state.checked}
            checked={this.state.checked}
         />
      )
   }

   callback(_event: React.ChangeEvent) {
      this.setState(state => ({ checked: !state.checked }))
      this.props.callback(_event)
   }
}
