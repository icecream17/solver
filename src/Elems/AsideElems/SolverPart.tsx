
import React from 'react'
import Solver from '../../Api/Solver'
import Sudoku from '../../Api/Spaces/Sudoku'
import { StrategyResult } from '../../Api/Types'
import StrategyControls from './StrategyControls'
import StrategyList from './StrategyList'

type SolverPartProps = Readonly<{
   sudoku: Sudoku
   solver: Solver
}>

/**
 * The solver part of the sudoku solver
 * TODO: Change to tab system. Sudoku controls vs strategy controls
 */
export default class SolverPart extends React.Component<SolverPartProps> {
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
      this.strategyItemStates = []

      this.whenControlsConstruct = this.whenControlsConstruct.bind(this)
      this.whenListConstructs = this.whenListConstructs.bind(this)
   }

   render() {
      return (
         <div className='SolverPart'>
            <StrategyControls solver={this.props.solver} whenConstruct={this.whenControlsConstruct} />
            <fieldset className="StrategyListContainer">
               <legend>strategies</legend>
               <StrategyList solver={this.props.solver} whenConstruct={this.whenListConstructs} />
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

   /** Called when a strategy starts - see the Solver api */
   notify(strategyIndex: number, strategyResult: StrategyResult) {
      this.strategyItemStates[strategyIndex] = strategyResult
   }
}
