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
import { _expect } from '../utils'
import { _ReactProps } from '../Types'

type AsideProps = Readonly<{
   sudoku: SudokuData
}> & _ReactProps

/**
 * @requiredProps
 * - sudoku
 */
export default class Aside extends React.Component<AsideProps> {
   constructor(props: AsideProps) {
      _expect(Aside, props).toHaveProperty("sudoku")
      super(props)
   }

   render() {
      return (
         <section className="App-aside">
            <SolverPart sudoku={this.props.sudoku} />
         </section>
      );
   }
}
