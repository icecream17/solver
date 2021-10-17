/**
 * IMPORTANT: This is represented by a section element
 * since it's actually directly related to the content
 *
 * But it's still... _aside_ ```<Main />```
 */

import './Aside.css'
import React from 'react'
import SolverPart from './AsideElems/SolverPart'
import SudokuData from '../Api/Spaces/Sudoku'
import { _ReactProps } from '../Types'

type AsideProps = Readonly<{
   sudoku: SudokuData
}> & _ReactProps

/**
 * Will be made of tabs later on
 */
export default class Aside extends React.Component<AsideProps> {
   render() {
      return (
         <section className="App-aside">
            <SolverPart sudoku={this.props.sudoku} />
         </section>
      );
   }
}
