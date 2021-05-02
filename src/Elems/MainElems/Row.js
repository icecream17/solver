
import React from 'react';

import Cell from './Cell';

/**
 * A row in a sudoku
 *
 * Also has a required index property. {integer}
 *
 * @example
 * <Row index={3} />
 */
export default class Row extends React.Component {
   constructor(props) {
      super(props)

      if (!('index' in props)) {
         throw TypeError('Row: Required property "index" is missing')
      }
   }

   render() {
      return (
         <tr className='Row'>
            <Cell row={this.props.index} column={0} />
            <Cell row={this.props.index} column={1} />
            <Cell row={this.props.index} column={2} />
            <Cell row={this.props.index} column={3} />
            <Cell row={this.props.index} column={4} />
            <Cell row={this.props.index} column={5} />
            <Cell row={this.props.index} column={6} />
            <Cell row={this.props.index} column={7} />
            <Cell row={this.props.index} column={8} />
         </tr>
      )
   }
}
