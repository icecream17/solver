
import React from 'react';

type StrategyTogglerProps = Readonly<{
   toggle: (event: React.SyntheticEvent) => void
   checked: boolean
   ariaLabel?: string
}>

/**
 * Turns a strategy off or on
 */
export default class StrategyToggler extends React.Component<StrategyTogglerProps> {
   constructor(props: StrategyTogglerProps) {
      super(props)

      this.toggle = this.toggle.bind(this)
   }

   render() {
      // Apparently there shouldn't be an aria-checked
      return (
         <input
            className="StrategyToggler"
            type="checkbox"
            role="switch"
            onChange={this.toggle}
            checked={this.props.checked}
            aria-label={this.props.ariaLabel}
         />
      )
   }

   toggle(_event: React.SyntheticEvent) {
      // this.props.toggle(_event)
      // This function does not have to do anything since the event bubbles up to the parent
   }
}
