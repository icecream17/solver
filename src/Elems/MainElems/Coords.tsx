
import './Coords.css'
import React from 'react';

import CoordRows from './CoordRows';
import CoordCols from './CoordCols';

/**
 * Sudoku coordinates
 * No setup required!
 *
 * @example
 * <Coords />
 */
export default class Coords extends React.Component {
   render() {
      return (
         <div className='Coords'>
            <CoordRows />
            <CoordCols />
         </div>
      )
   }
}
