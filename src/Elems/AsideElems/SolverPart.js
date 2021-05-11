
import React from 'react'
import Solver from '../../Api/Solver'
import StrategyControls from './StrategyControls'
import StrategyList from './StrategyList'

/**
 * The solver part of the sudoku solver
 *
 * @requiredProps
 * - sudoku
 */
export default class SolverPart extends React.Component {
   constructor(props) {
      for (const requiredProperty of ["sudoku"]) {
         if (!(requiredProperty in props)) {
            throw TypeError(`SolverPart: Required property "${requiredProperty}" is missing`)
         }
      }

      super(props)

      this.solver = new Solver()
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

   whenControlsConstruct(controls) {
      this.children.controls = controls
   }

   whenListConstructs(list) {
      this.children.list = list
   }
}
