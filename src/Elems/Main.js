import './Main.css'
import React from 'react'

import Sudoku from './MainElems/Sudoku'
import Data from './MainElems/Data';
import Coords from './MainElems/Coords';

/**
 * The "main" component, which includes the Data, Sudoku, and Coords components
 *
 * @requiredProps
 * - whenSudokuUpdates
 */
class Main extends React.Component {
   constructor(props) {
      for (const requiredProperty of ["whenSudokuUpdates"]) {
         if (!(requiredProperty in props)) {
            throw TypeError(`Sudoku: Required property "${requiredProperty}" is missing`)
         }
      }

      super(props)
   }

   render() {
      return (
         <main className="App-main">
            <Data />
            <Sudoku whenUpdate={this.props.whenSudokuUpdates} />
            <Coords />
         </main>
      );
   }
}

export default Main
