import './Main.css'
import React from 'react'

import Sudoku, { BaseSudokuProps } from './MainElems/Sudoku'

type MainProps = Readonly<{
   propsPassedDown: BaseSudokuProps
}>

/**
 * The "main" component
 * (But only contains Sudoku)
 */
export default function Main (props: MainProps) {
   return (
      <main className="App-main">
         <Sudoku {...props.propsPassedDown} />
      </main>
   );
}
