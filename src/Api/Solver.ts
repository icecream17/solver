import SolverPart from "../Elems/AsideElems/SolverPart"
import StrategyItem from "../Elems/AsideElems/StrategyItem"
import Strategies from "./Strategies"
import Sudoku from "./Sudoku"
import { StrategyResult } from "./Types"

export default class Solver {
   strategyIndex: number
   solved: number
   strategyItemElements: StrategyItem[]
   latestStrategyItem: StrategyItem | null
   constructor (public sudoku: null | Sudoku, public solverElement: SolverPart) {
      this.strategyIndex = 0
      this.solved = 0
      this.strategyItemElements = []
      this.latestStrategyItem = null // Previously named "lastStrategyItem"

      this.Go = this.Go.bind(this)
      this.Step = this.Step.bind(this)
      this.Undo = this.Undo.bind(this)
   }

   /**
    * Called after the last strategy is done,
    * and just before the first strategy is done.
    */
   resetStrategies () {
      for (const strategyElement of this.strategyItemElements) {
         strategyElement.setState({
            success: null,
            successcount: null
         })
      }
   }

   updateCounters (success: boolean) {
      // Go back to the start when a strategy succeeds
      // (but not if you're already at the start)
      if (success && this.strategyIndex > 0) {
         this.strategyIndex = 0
      } else {
         this.strategyIndex++
         if (this.strategyIndex === Strategies.length) {
            this.strategyIndex = 0
         }
      }
   }

   Step(): StrategyResult {
      if (this.sudoku === null) {
         if (this.solverElement.props.sudoku === null) {
            throw ReferenceError('Uninitialized sudoku!')
         } else {
            this.sudoku = this.solverElement.props.sudoku
         }
      }

      // See resetStrategies documentation
      if (this.strategyIndex === 0) {
         this.resetStrategies()
      }

      // strategyItem UI - update lastStrategyItem
      if (this.latestStrategyItem !== null) {
         this.latestStrategyItem.setState({ isCurrentStrategy: false })
      }

      if (this.strategyIndex in this.strategyItemElements) {
         this.latestStrategyItem = this.strategyItemElements[this.strategyIndex]

         // Don't run strategy if it's disabled,
         // instead move on to the next strategy
         if (this.latestStrategyItem.state.disabled) {
            this.updateCounters(false)
            return this.Step()
         }

         // Not disabled, so update state
         this.latestStrategyItem.setState({
            isCurrentStrategy: true
         })
      } else {
         console.warn(`undefined strategyItemElement @${this.strategyIndex}`)
         this.latestStrategyItem = null
      }

      // Run strategy
      const strategyResult = Strategies[this.strategyIndex](this.sudoku, this)

      // strategyItem UI - update lastStrategyItem state
      if (this.latestStrategyItem !== null) {
         const newState = {
            success: strategyResult.success,
            successcount: strategyResult.successcount ?? null
         } as const

         this.latestStrategyItem.setState(newState)
      }

      this.updateCounters(strategyResult.success)

      return strategyResult
   }

   /** Does "Step" until it reaches the end or a strategy succeeds */
   Go () {
      do {
         this.Step()
      } while (this.strategyIndex !== 0)
   }

   Undo () {
      // TODO
   }

   Import () {
      this.sudoku.import(prompt("Enter data (todo: clarify)"))
   }
}
