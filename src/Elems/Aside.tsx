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

type AsideProps = Readonly<{
   sudoku: null | typeof Sudoku.prototype.data
} & typeof React.Component.prototype.props>

/**
 * @requiredProps
 * - sudoku
 */
export default class Aside extends React.Component {
   props!: AsideProps
   constructor(props: AsideProps) {
      for (const requiredProperty of ["sudoku"] as const) {
         if (!(requiredProperty in props)) {
            throw TypeError(`Aside: Required property "${requiredProperty}" is missing`)
         }
      }

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
