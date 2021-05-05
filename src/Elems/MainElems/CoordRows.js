
import React from 'react';
import CoordRow from './CoordRow';

/**
 * Group of Sudoku rows
 *
 * @example
 * <CoordRows />
 */
export default class CoordRows extends React.Component {
   render() {
      return (
         <div className='CoordRows'>
            <CoordRow index={1} value="A" />
            <CoordRow index={2} value="B" />
            <CoordRow index={3} value="C" />
            <CoordRow index={4} value="D" />
            <CoordRow index={5} value="E" />
            <CoordRow index={6} value="F" />
            <CoordRow index={7} value="G" />
            <CoordRow index={8} value="H" />
            <CoordRow index={9} value="J" />
         </div>
      )
   }
}
