/**
 * IMPORTANT: This is represented by a section element
 * since it's actually directly related to the content
 *
 * But it's still... _aside_ ```<Main />```
 */

import './Aside.css'
import React from 'react'
import SolverPart from './AsideElems/SolverPart'
import Sudoku from './MainElems/Sudoku'
import _expect from '../expectProps'

type AsideProps = Readonly<{
   sudoku: null | typeof Sudoku.prototype.data
} & typeof React.Component.prototype.props>

/**
 * @requiredProps
 * - sudoku
 */
export default class Aside extends React.Component<AsideProps> {
   constructor(props: AsideProps) {
      _expect(Aside, props).toHaveProperties("sudoku")
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
