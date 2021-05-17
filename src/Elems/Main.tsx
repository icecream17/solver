import './Main.css'
import React from 'react'

import Sudoku from './MainElems/Sudoku'
import DataContainer from './MainElems/Data';
import Coords from './MainElems/Coords';

type MainProps = Readonly<{
   whenSudokuConstructs (...args: any): any
}>

/**
 * The "main" component, which includes the Data, Sudoku, and Coords components
 *
 * @requiredProps
 * - whenSudokuConstructs
 */
class Main extends React.Component<MainProps> {
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
            <DataContainer />
            <Sudoku whenConstruct={this.props.whenSudokuConstructs} />
            <Coords />
         </main>
      );
   }
}

export default Main
