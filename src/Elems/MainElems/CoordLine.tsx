
import React from 'react';
import { IndexToNine } from '../../Types';

type CoordLineProps = Readonly<{
   index: IndexToNine,
   value: typeof React.Component.prototype.props.children
} & typeof React.Component.prototype.props>

/**
 * Abstract class
 *
 * @example
 * <CoordLine children={3} />
 */
export default class CoordLine extends React.Component {
   props!: CoordLineProps

   render() {
      return (
         <div data-index={this.props.index}>
            {this.props.value}
         </div>
      )
   }
}
