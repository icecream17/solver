import React from 'react';

type ControlProps = Readonly<{
   className?: string
   onClick: React.MouseEventHandler
}>

/**
 * A general button control
 */
export default class Control extends React.PureComponent<ControlProps> {
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
