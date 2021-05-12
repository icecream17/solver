
import React from 'react';
import CoordLine from './CoordLine';

/**
 * Letters for the rows of the sudoku
 *
 * @example
 * <CoordRow children={3} />
 */
export default class CoordRow extends CoordLine {
   render() {
      return (
         <CoordLine className='CoordRow' {...this.props} />
      )
   }
}
