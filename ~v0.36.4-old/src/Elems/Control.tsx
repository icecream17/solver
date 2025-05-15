import React from 'react';

type ControlProps = Readonly<{
   className?: string
   name?: string
   children?: React.ReactNode
   onClick: React.MouseEventHandler // required
   innerRef?: React.LegacyRef<HTMLButtonElement> | undefined // ref shenanigans
}> & React.ButtonHTMLAttributes<HTMLButtonElement>

/**
 * A general button control
 *
 * Use `innerRef` to set ref
 */
export default class Control extends React.PureComponent<ControlProps> {
   render() {
      const { className="Control", innerRef, ...restOfProps } = this.props
      return (
         <button
            className={className}
            type='button'
            ref={innerRef}
            {...restOfProps}
         >{this.props.children ?? this.props.name}</button>
      )
   }
}
