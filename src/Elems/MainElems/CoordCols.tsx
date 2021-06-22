
import React from 'react';
import CoordCol from './CoordCol';

/**
 * Labels the rows of the sudoku
 *
 * Group of CoordCol
 *
 * @example
 * <CoordCols />
 */
export default class CoordCols extends React.Component {
   render() {
      return (
         <div className='CoordCols'>
            <CoordCol index={0} value="1" />
            <CoordCol index={1} value="2" />
            <CoordCol index={2} value="3" />
            <CoordCol index={3} value="4" />
            <CoordCol index={4} value="5" />
            <CoordCol index={5} value="6" />
            <CoordCol index={6} value="7" />
            <CoordCol index={7} value="8" />
            <CoordCol index={8} value="9" />
         </div>
      )
   }
}
