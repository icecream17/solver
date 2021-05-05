
import React from 'react';

/**
 * Letters for the columns of the sudoku
 *
 * @example
 * <CoordCol children={3} />
 */
export default class CoordCol extends React.Component {
   render() {
      return (
         <div className='CoordCol'>
            {this.props.value}
         </div>
      )
   }
}
