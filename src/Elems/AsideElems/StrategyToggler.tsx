
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
 *
 * @requiredProps
 * - callback
 * - id
 */
export default class StrategyToggler extends React.Component<StrategyTogglerProps, StrategyTogglerState> {
   constructor(props: StrategyTogglerProps) {
      for (const requiredProperty of ["callback", "id"]) {
         if (!(requiredProperty in props)) {
            throw TypeError(`StrategyToggler: Required prop.state "${requiredProperty}" is missing`)
         }
      }

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
