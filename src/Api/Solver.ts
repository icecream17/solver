import SolverPart from "../Elems/AsideElems/SolverPart"
import StrategyItem from "../Elems/AsideElems/StrategyItem"
import Strategies from "./Strategies"
import Sudoku from "./Sudoku"
import { StrategyResult } from "./Types"

export default class Solver {
   // Previously named "lastStrategyItem"
   latestStrategyItem: null | StrategyItem = null
   solved: number = 0
   strategyIndex: number = 0
   strategyItemElements: StrategyItem[] = []
   todo: Promise<any>[] = [] // Makes sure "Step" is always run in order.
   constructor (public sudoku: null | Sudoku = null, public solverElement: SolverPart) {
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

   sudokuNullCheck (): asserts this is {sudoku: Sudoku} {
      if (this.sudoku === null) {
         if (this.solverElement.props.sudoku === null) {
            throw ReferenceError('Uninitialized sudoku!')
         } else {
            this.sudoku = this.solverElement.props.sudoku
         }
      }
   }

   // This does the step.
   async _Step(): Promise<StrategyResult> {
      this.sudokuNullCheck()

      // See resetStrategies documentation
      if (this.strategyIndex === 0) {
         this.resetStrategies()
      }

      // strategyItem UI - update lastStrategyItem
      if (this.latestStrategyItem !== null) {
         this.latestStrategyItem.setState({ isCurrentStrategy: false })
      }

      // https://stackoverflow.com/questions/47019199/why-does-async-await-work-with-react-setstate
      // Now the state is updated, necessary for "this.Step" below.
      await undefined

      if (this.strategyIndex in this.strategyItemElements) {
         this.latestStrategyItem = this.strategyItemElements[this.strategyIndex]

         // Don't run strategy if it's disabled,
         // instead move on to the next strategy
         if (this.latestStrategyItem.state.disabled) {
            this.updateCounters(false)
            return this._Step()
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

      // https://stackoverflow.com/questions/47019199/why-does-async-await-work-with-react-setstate
      // Now the state is updated, necessary for "this.Go"
      await undefined

      return strategyResult
   }

   // Waits until `todo` is finished, then does _Step
   async Step(): Promise<StrategyResult> {
      // 1. Copy the old todo
      const todoCopy = this.todo.slice()

      // 2. Add this promise to the current todo ASAP
      const promise = this._Step() // The old todo is still the same
      this.todo.push(promise)

      // 3. Wait for the old todo
      await Promise.allSettled(todoCopy)

      // 4. Now do this promise
      const result = await promise

      // 5. Remove this promise from todo
      this.todo.splice(this.todo.indexOf(promise), 1)

      // Finish
      return result
   }

   /** Does "Step" until it reaches the end or a strategy succeeds */
   async Go () {
      const results = [] as StrategyResult
      do {
         results.push(await this.Step())
      } while (this.strategyIndex !== 0)
      return results
   }

   Undo () {
      // TODO
   }

   Import () {
      const result = prompt("Enter data (todo: clarify)")
      if (result === null) {
         return; // Maybe do something else
      }

      this.sudokuNullCheck()
      this.sudoku.import(result)
   }
}
