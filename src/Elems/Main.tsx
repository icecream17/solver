import './Main.css'
import React from 'react'

import Sudoku from './MainElems/Sudoku'
import DataContainer from './MainElems/Data'
import Coords from './MainElems/Coords'
import { _expect } from '../utils'
import { _Function } from '../Types'

type MainProps = Readonly<{
   whenSudokuConstructs: _Function
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
            <Coords />
            <Sudoku whenConstruct={this.props.whenSudokuConstructs} />
            <DataContainer />
         </main>
      );
   }
}

export default Main
