
import React from 'react';
import { IndexToNine } from '../../Types';

type CoordLineProps = Readonly<{
   index: IndexToNine,
   value: typeof React.Component.prototype.props.children,
   className?: typeof React.Component.prototype.props.className
}>

/**
 * Abstract class
 *
 * @example
 * <CoordLine children={3} />
 */
export default class CoordLine extends React.Component<CoordLineProps> {
   render() {
      return (
         <div data-index={this.props.index} className={this.props?.className ?? "CoordLine"}>
            {this.props.value}
         </div>
      )
   }
}
