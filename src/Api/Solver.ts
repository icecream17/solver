import SolverPart from "../Elems/AsideElems/SolverPart"
import StrategyItem from "../Elems/AsideElems/StrategyItem"
import { IndexToNine } from "../Types"
import { forComponentsToUpdate } from "../utils"
import Strategies from "./Strategies"
import Sudoku from "./Sudoku"
import { StrategyResult } from "./Types"

export default class Solver {
   latestStrategyItem: null | StrategyItem = null
   isDoingStep = false
   solved = 0
   stepsTodo = 0
   strategyIndex = 0
   strategyItemElements: StrategyItem[] = []
   constructor(public sudoku: null | Sudoku = null, public solverElement: SolverPart) {
      // These capitalized methods are used as handlers in StrategyControls, so they need to be bound beforehand.
      this.Go = this.Go.bind(this)
      this.Step = this.Step.bind(this)
      this.Undo = this.Undo.bind(this)
      this.Import = this.Import.bind(this)
      this.Clear = this.Clear.bind(this)
   }

   /**
    * Called after the last strategy is done,
    * and just before the first strategy is done.
    */
   resetStrategies() {
      for (const strategyElement of this.strategyItemElements) {
         strategyElement.setState({
            success: null,
            successcount: null
         })
      }
   }

   updateCounters(success: boolean) {
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

   sudokuNullCheck(): asserts this is { sudoku: Sudoku } {
      if (this.sudoku === null) {
         if (this.solverElement.props.sudoku === null) {
            throw ReferenceError('Uninitialized sudoku!')
         } else {
            this.sudoku = this.solverElement.props.sudoku
         }
      }
   }

   async Step(): Promise<StrategyResult> {
      await forComponentsToUpdate()
      if (this.isDoingStep) {
         throw new Error("Aaaaaa - can't do two steps at the same time")
      }

      this.isDoingStep = true
      this.sudokuNullCheck()

      // See resetStrategies documentation
      if (this.strategyIndex === 0) {
         this.resetStrategies()
         await forComponentsToUpdate()
      }

      // strategyItem UI - update lastStrategyItem
      if (this.latestStrategyItem !== null) {
         this.latestStrategyItem.setState({ isCurrentStrategy: false })
         await forComponentsToUpdate()
      }

      if (this.strategyIndex in this.strategyItemElements) {
         this.latestStrategyItem = this.strategyItemElements[this.strategyIndex]

         // Don't run strategy if it's disabled,
         // instead move on to the next strategy
         if (this.latestStrategyItem.state.disabled) {
            this.updateCounters(false)
            await forComponentsToUpdate()
            return this.Step()
         }

         // Not disabled, so update state
         this.latestStrategyItem.setState({
            isCurrentStrategy: true
         })
         await forComponentsToUpdate()
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
         await forComponentsToUpdate()
      }

      this.updateCounters(strategyResult.success)
      await forComponentsToUpdate()

      if (this.stepsTodo > 1) {
         this.stepsTodo--
         try {
            this.Step()
         } catch (error) {
            console.error(error)
         }
      }

      this.isDoingStep = false
      return strategyResult
   }

   /** Does "Step" until it reaches the end or a strategy succeeds */
   async Go() {
      do {
         await this.Step()
      } while (this.strategyIndex !== 0)
   }

   Undo() {
      // TODO
   }

   Import() {
      const result = prompt("Enter data (todo: clarify)")
      if (result === null) {
         return; // Maybe do something else
      }

      this.sudokuNullCheck()
      this.sudoku.import(result)
   }

   Clear() {
      this.sudokuNullCheck()

      // Apparently "void" means "ignored promise"
      for (let i: IndexToNine = 0; i < 9; i = i+1 as IndexToNine) {
         for (let j: IndexToNine = 0; j < 9; j = j+1 as IndexToNine) {
            void this.sudoku.set(i, j).to(1, 2, 3, 4, 5, 6, 7, 8, 9)
         }
      }
   }
}
