
import React from 'react';
import StaticComponent from './StaticComponent';

/**
 * The title
 *
 * @example
 * <Title />
 */
export default class Title extends StaticComponent {
   render() {
      return <h1 className='Title'>Sudoku solver</h1>
   }
}
