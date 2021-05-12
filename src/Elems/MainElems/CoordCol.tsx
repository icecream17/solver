
import React from 'react';
import CoordLine from './CoordLine';

/**
 * Letters for the columns of the sudoku
 *
 * @example
 * <CoordCol children={3} />
 */
export default class CoordCol extends CoordLine {
   render() {
      return (
         <CoordLine className='CoordRow' {...this.props} />
      )
   }
}
