import './Main.css'
import React from 'react'

import Sudoku, { SudokuProps } from './MainElems/Sudoku'

type MainProps = Readonly<{
   sudokuProps: SudokuProps
}>

/**
 * The "main" component
 * (But only contains Sudoku)
 */
export default function Main (props: MainProps) {
   return (
      <main className="App-main">
         <Sudoku {...props.sudokuProps} />
      </main>
   )
}
