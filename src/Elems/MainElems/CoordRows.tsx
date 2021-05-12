
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
            <CoordRow index={0} value="A" />
            <CoordRow index={1} value="B" />
            <CoordRow index={2} value="C" />
            <CoordRow index={3} value="D" />
            <CoordRow index={4} value="E" />
            <CoordRow index={5} value="F" />
            <CoordRow index={6} value="G" />
            <CoordRow index={7} value="H" />
            <CoordRow index={8} value="J" />
         </div>
      )
   }
}
