
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

      for (const requiredProp of ['index', 'callback']) {
         if (!(requiredProp in props)) {
            throw TypeError(`Row: Required property ${requiredProp} is missing`)
         }
      }
   }

   render() {
      return (
         <tr className='Row'>
            <Cell row={this.props.index} column={0} callback={this.props.callback} />
            <Cell row={this.props.index} column={1} callback={this.props.callback} />
            <Cell row={this.props.index} column={2} callback={this.props.callback} />
            <Cell row={this.props.index} column={3} callback={this.props.callback} />
            <Cell row={this.props.index} column={4} callback={this.props.callback} />
            <Cell row={this.props.index} column={5} callback={this.props.callback} />
            <Cell row={this.props.index} column={6} callback={this.props.callback} />
            <Cell row={this.props.index} column={7} callback={this.props.callback} />
            <Cell row={this.props.index} column={8} callback={this.props.callback} />
         </tr>
      )
   }
}
