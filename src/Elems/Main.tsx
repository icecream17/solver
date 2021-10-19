import './Main.css'
import React from 'react'

import Sudoku, { BaseSudokuProps } from './MainElems/Sudoku'
import Coords from './MainElems/Coords'

type MainProps = Readonly<{
   propsPassedDown: BaseSudokuProps
}>

/**
 * The "main" component, which is just the sudoku parts for now.
 *
 * Currently the parts are Coords and Sudoku
 * TODO: Remove coords
 */
class Main extends React.Component<MainProps> {
   render() {
      return (
         <main className="App-main">
            <Coords />
            <Sudoku {...this.props.propsPassedDown} />
         </main>
      );
   }
}

export default Main
