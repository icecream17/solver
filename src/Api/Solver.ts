import asyncPrompt from "../asyncPrompt"
import SolverPart from "../Elems/AsideElems/SolverPart"
import StrategyItem from "../Elems/AsideElems/StrategyItem"
import { forComponentsToUpdate } from "../utils"
import Strategies from "./Strategies/Strategies"
import Sudoku from "./Sudoku"

export default class Solver {
   latestStrategyItem: null | StrategyItem = null
   isDoingStep = false
   solved = 0
   stepsTodo = 0
   strategyIndex = 0
   /** When a strategy item is about to unmount, the strategy item element is deleted. */
   strategyItemElements: Array<StrategyItem | undefined> = []

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
         if (strategyElement === undefined) {
            console.warn(`undefined strategyItemElement @resetStrategies`)
            continue;
         }

         strategyElement.setState({
            success: null,
            successcount: null
         })
      }
   }

   updateCounters(success: boolean, isFinished: boolean) {
      // Go back to the start when a strategy succeeds
      // (exception: if you're at the start go to 1 anyways)
      // (exception exception: if the sudoku is finished don't go to 1)
      if (success && this.strategyIndex > 0) {
         this.strategyIndex = 0
      } else {
         this.strategyIndex++
         if (this.strategyIndex === Strategies.length || isFinished) {
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

   async Step(): Promise<undefined> {
      await forComponentsToUpdate()
      if (this.isDoingStep) {
         this.stepsTodo++
         return;
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

      if (this.strategyItemElements[this.strategyIndex] === undefined) {
         console.warn(`undefined strategyItemElement @${this.strategyIndex}`)
         this.latestStrategyItem = null
      } else {
         this.latestStrategyItem = this.strategyItemElements[this.strategyIndex] as StrategyItem

         // Don't run strategy if it's disabled,
         // instead move on to the next strategy
         if (this.latestStrategyItem.state.disabled) {
            this.updateCounters(false, false)
            await forComponentsToUpdate() // currently unneccessary
            return this.Step()
         }

         // Not disabled, so update state
         this.latestStrategyItem.setState({
            isCurrentStrategy: true
         })
         await forComponentsToUpdate()
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

      this.updateCounters(strategyResult.success, strategyResult.successcount === 81)
      await forComponentsToUpdate()

      if (this.stepsTodo > 0) {
         this.stepsTodo--
         try {
            await this.Step()
         } catch (error) {
            console.error(error)
         }
      }

      this.isDoingStep = false
      return undefined;
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

   async Import() {
      const result = await asyncPrompt("Enter data (todo: clarify)")
      if (result === null || result === "") {
         return; // Maybe do something else
      }

      this.sudokuNullCheck()
      this.sudoku.import(result)
   }

   Clear() {
      this.sudokuNullCheck()
      this.sudoku.clear()
   }
}
