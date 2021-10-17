
import React from 'react';

type StrategyTogglerProps = Readonly<{
   callback: React.ChangeEventHandler
   id: string
}>

type StrategyTogglerState = Readonly<{
   checked: boolean
}>

/**
 * Turns a strategy off or on
 */
export default class StrategyToggler extends React.Component<StrategyTogglerProps, StrategyTogglerState> {
   constructor(props: StrategyTogglerProps) {
      super(props)

      this.state = {
         checked: true
      }
   }

   render() {
      // Apparently there shouldn't be an aria-checked
      return (
         <input
            className="StrategyToggler"
            id={this.props.id}
            type="checkbox"
            role="switch"
            onChange={this.callback.bind(this)}
            checked={this.state.checked}
         />
      )
   }

   callback(_event: React.ChangeEvent) {
      this.setState(state => ({ checked: !state.checked }))
      this.props.callback(_event)
   }
}
