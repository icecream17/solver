import React from 'react';
import { _expect } from '../utils';

type ControlProps = Readonly<{
   className?: string
   onClick: React.MouseEventHandler
}>

/**
 * A general button control
 */
export default class Control extends React.Component<ControlProps> {
   constructor(props: ControlProps) {
      _expect(Control, props).toHaveProperties("onClick")
      super(props)
   }

   render() {
      const className = this.props.className ?? 'Control'
      return (
         <button
            type='button'
            className={className}
            onClick={this.props.onClick}
         >{this.props.children}</button>
      )
   }
}
