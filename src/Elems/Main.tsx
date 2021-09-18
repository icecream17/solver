import './Main.css'
import React from 'react'

import Sudoku, { BaseSudokuProps } from './MainElems/Sudoku'
import DataContainer from './MainElems/Data'
import Coords from './MainElems/Coords'
import { _expect } from '../utils'

type MainProps = Readonly<{
   propsPassedDown: BaseSudokuProps
}>

/**
 * The "main" component, which includes the Data, Sudoku, and Coords components
 *
 * @requiredProps
 * - whenSudokuConstructs
 */
class Main extends React.Component<MainProps> {
   constructor(props: MainProps) {
      _expect(Main, props).toHaveProperty("propsPassedDown")
      super(props)
   }

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
