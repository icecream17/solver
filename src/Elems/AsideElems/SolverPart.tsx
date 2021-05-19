
import React from 'react'
import Solver from '../../Api/Solver'
import Sudoku from '../../Api/Sudoku'
import StrategyControls from './StrategyControls'
import StrategyList from './StrategyList'

type SolverPartProps = Readonly<{
   sudoku: null | Sudoku
}>

/**
 * The solver part of the sudoku solver
 *
 * @requiredProps
 * - sudoku
 */
export default class SolverPart extends React.Component<SolverPartProps> {
   solver: Solver
   children: {
      controls: null | StrategyControls,
      list: null | StrategyList
   }
   constructor(props: SolverPartProps) {
      for (const requiredProperty of ["sudoku"] as const) {
         if (!(requiredProperty in props)) {
            throw TypeError(`SolverPart: Required property "${requiredProperty}" is missing`)
         }
      }

      super(props)

      this.solver = new Solver(this.props.sudoku)
      this.children = {
         controls: null,
         list: null
      }

      this.whenControlsConstruct = this.whenControlsConstruct.bind(this)
      this.whenListConstructs = this.whenListConstructs.bind(this)
   }

   render() {
      return (
         <div className='SolverPart'>
            <StrategyControls solver={this.solver} whenConstruct={this.whenControlsConstruct} />
            <fieldset className="StrategyListContainer">
               <legend>strategies</legend>
               <StrategyList solver={this.solver} whenConstruct={this.whenListConstructs} />
            </fieldset>
        </div>
      )
   }

   whenControlsConstruct(controls: StrategyControls) {
      this.children.controls = controls
   }

   whenListConstructs(list: StrategyList) {
      this.children.list = list
   }
}