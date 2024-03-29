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
import Tabs from './AsideElems/Tabs'
import Control from './Control'
import Solver from '../Api/Solver'

type AsideProps = Readonly<{
   sudoku: SudokuData,
   solver: Solver,
}>

type AsideState = Readonly<{
   selectedTab: number
}>


const tabNames = ["solving tools", "strategies"]

/**
 * Currently a window of tabs
 */
export default class Aside extends React.Component<AsideProps, AsideState> {
   constructor (props: AsideProps) {
      super(props)

      this.state = {
         selectedTab: 0
      }

      this.whenTabChange = this.whenTabChange.bind(this)
   }

   render() {
      let content: JSX.Element
      if (this.state.selectedTab === 0) {
         content = <>
            <Control onClick={this.props.solver.Clear} name="clear" />
            <Control onClick={this.props.solver.Import} name="import" />
            <Control onClick={this.props.solver.Export} name="export" />
         </>
      } else if (this.state.selectedTab === 1) {
         content =
            <SolverPart sudoku={this.props.sudoku} solver={this.props.solver} />
      } else {
         throw new ReferenceError(`unknown Selected tab index: ${this.state.selectedTab}`)
      }

      /**
       * Tabpanel id used in Tabs (aria-owns)
       * div because that's what's recommended
       * tabindex for focusability but not tabbability (-1)
       */
      return (
         <section className="App-aside">
            <Tabs whenTabChange={this.whenTabChange} tabNames={tabNames} />
            <div role="tabpanel" id="TabContent" aria-labelledby={`Tab${this.state.selectedTab}`} tabIndex={-1}>{content}</div>
         </section>
      );
   }

   whenTabChange(index: number) {
      this.setState({ selectedTab: index })
   }
}
