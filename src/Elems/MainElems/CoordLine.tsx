
import React from 'react';
import { IndexToNine, _ReactProps } from '../../Types';

type CoordLineProps = Readonly<{
   index: IndexToNine,
   value: _ReactProps["children"],
   className?: React.HTMLAttributes<HTMLDivElement>["className"]
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
         <div data-index={this.props.index} className={this.props.className ?? "CoordLine"}>
            {this.props.value}
         </div>
      )
   }
}
