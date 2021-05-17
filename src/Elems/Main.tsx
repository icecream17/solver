import './Main.css'
import React from 'react'

import Sudoku from './MainElems/Sudoku'
import Data from './MainElems/Data';
import Coords from './MainElems/Coords';

type MainProps = Readonly<{
   whenSudokuConstructs (...args: any): any
} & typeof React.Component.prototype.props>

/**
 * The "main" component, which includes the Data, Sudoku, and Coords components
 *
 * @requiredProps
 * - whenSudokuConstructs
 */
class Main extends React.Component {
   props!: MainProps
   constructor(props: MainProps) {
      for (const requiredProperty of ["whenSudokuConstructs"] as const) {
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
            <Sudoku whenConstruct={this.props.whenSudokuConstructs} />
            <Coords />
         </main>
      );
   }
}

export default Main
