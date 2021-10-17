import './Main.css'
import React from 'react'

import Sudoku, { BaseSudokuProps } from './MainElems/Sudoku'
import DataContainer from './MainElems/Data'
import Coords from './MainElems/Coords'

type MainProps = Readonly<{
   propsPassedDown: BaseSudokuProps
}>

/**
 * The "main" component, which is just the sudoku parts for now.
 *
 * Currently the parts are Coords, Sudoku, and Data
 * TODO: Remove Data
 */
class Main extends React.Component<MainProps> {
   render() {
      return (
         <main className="App-main">
            <Coords />
            <Sudoku {...this.props.propsPassedDown} />
            <DataContainer />
         </main>
      );
   }
}

export default Main
