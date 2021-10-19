import React from 'react';

type ControlProps = Readonly<{
   className?: string
   name?: string

   onClick: React.MouseEventHandler // required
}> & React.ButtonHTMLAttributes<HTMLButtonElement>

/**
 * A general button control
 */
export default class Control extends React.PureComponent<ControlProps> {
   render() {
      const className = this.props.className ?? 'Control'
      return (
         <button
            type='button'
            {...this.props}
            className={className}
         >{this.props.children ?? this.props.name}</button>
      )
   }
}
