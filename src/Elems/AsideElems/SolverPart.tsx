
import React from 'react'
import Solver from '../../Api/Solver'
import Sudoku from '../../Api/Spaces/Sudoku'
import { StrategyResult } from '../../Api/Types'
import StrategyControls from './StrategyControls'
import StrategyList from './StrategyList'

type SolverPartProps = Readonly<{
   sudoku: Sudoku
}>

/**
 * The solver part of the sudoku solver
 * TODO: Change to tab system. Sudoku controls vs strategy controls
 */
export default class SolverPart extends React.Component<SolverPartProps> {
   solver: Solver
   children: {
      controls: null | StrategyControls
      list: null | StrategyList
   }
   strategyItemStates: StrategyResult[]
   constructor(props: SolverPartProps) {
      super(props)

      this.children = {
         controls: null,
         list: null
      }
      this.solver = new Solver(this.props.sudoku, this as SolverPart)
      this.strategyItemStates = []

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

   /** Called when a strategy is tried - see the Solver api */
   notify(strategyIndex: number, strategyResult: StrategyResult) {
      this.strategyItemStates[strategyIndex] = strategyResult
   }
}
