
import React from 'react';

/**
 * Letters for the rows of the sudoku
 *
 * @example
 * <CoordRow children={3} />
 */
export default class CoordRow extends React.Component {
   render() {
      return (
         <div className='CoordRow'>
            {this.props.value}
         </div>
      )
   }
}
