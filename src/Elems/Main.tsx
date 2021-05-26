import './Main.css'
import React from 'react'

import Sudoku from './MainElems/Sudoku'
import DataContainer from './MainElems/Data'
import Coords from './MainElems/Coords'
import _expect from '../expectProps'

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
      _expect(Main, props).toHaveProperty("whenSudokuConstructs")

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
