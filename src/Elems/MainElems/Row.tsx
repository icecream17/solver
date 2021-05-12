
import React from 'react';
import { IndexToNine } from '../../Types';

import Cell from './Cell';

type RowProps = Readonly<{
   index: IndexToNine,
   whenCellConstructs?(...args: any): any
} & typeof React.Component.prototype.props>

/**
 * A row in a sudoku
 *
 * @example
 * <Row index={3} />
 *
 * @requiredProps
 * - index
 * - whenCellConstructs
 */
export default class Row extends React.Component {
   props!: RowProps
   constructor(props: RowProps) {
      for (const requiredProp of ['index', 'whenCellConstructs']) {
         if (!(requiredProp in props)) {
            throw TypeError(`Row: Required property ${requiredProp} is missing`)
         }
      }

      super(props)
   }

   render() {
      return (
         <tr className='Row'>
            <Cell row={this.props.index} column={0} whenConstruct={this.props.whenCellConstructs} />
            <Cell row={this.props.index} column={1} whenConstruct={this.props.whenCellConstructs} />
            <Cell row={this.props.index} column={2} whenConstruct={this.props.whenCellConstructs} />
            <Cell row={this.props.index} column={3} whenConstruct={this.props.whenCellConstructs} />
            <Cell row={this.props.index} column={4} whenConstruct={this.props.whenCellConstructs} />
            <Cell row={this.props.index} column={5} whenConstruct={this.props.whenCellConstructs} />
            <Cell row={this.props.index} column={6} whenConstruct={this.props.whenCellConstructs} />
            <Cell row={this.props.index} column={7} whenConstruct={this.props.whenCellConstructs} />
            <Cell row={this.props.index} column={8} whenConstruct={this.props.whenCellConstructs} />
         </tr>
      )
   }
}
