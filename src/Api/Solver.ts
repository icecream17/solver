import asyncPrompt from "../asyncPrompt"
import SolverPart from "../Elems/AsideElems/SolverPart"
import StrategyItem from "../Elems/AsideElems/StrategyItem"
import { AlertType } from "../Types"
import { forComponentsToUpdate } from "../utils"
import Strategies from "./Strategies/Strategies"
import Sudoku from "./Sudoku"
import { SuccessError } from "./Types"

export default class Solver {
   latestStrategyItem: null | StrategyItem = null
   isDoingStep = false
   erroring = false
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
   async resetStrategies() {
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

      await forComponentsToUpdate()
   }

   updateCounters(success: boolean, isFinished: boolean) {
      // Go back to the start when a strategy succeeds
      // (exception: if you're at the start go to 1 anyways)
      // (exception exception: if the sudoku is finished don't go to 1)
      // (another exception: always be at the start if erroring)
      if ((success && this.strategyIndex > 0) || this.erroring || isFinished) {
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

   async setupCells() {
      this.sudokuNullCheck()
      for (const row of this.sudoku.cells) {
         for (const cell of row) {
            cell?.setState({ explaining: true })
         }
      }
      await forComponentsToUpdate()
   }

   /**
    * Kind of a misnomer really.
    *
    * For each cell, setState:
    *    explaining: false
    *    previousCandidates: null
    */
   async resetCells() {
      this.sudokuNullCheck()
      for (const row of this.sudoku.cells) {
         for (const cell of row) {
            cell?.setState({ explaining: false, previousCandidates: null })
         }
      }
      await forComponentsToUpdate()
   }

   // This is a big function.
   // Each comment labels a group of code that does something

   // Originally Promise<undefined>
   async Step(): Promise<void> {
      await forComponentsToUpdate()

      this.erroring = false

      if (this.isDoingStep) {
         this.stepsTodo++
         return;
      }

      this.isDoingStep = true
      this.sudokuNullCheck()

      // See resetStrategies documentation
      if (this.strategyIndex === 0) {
         await this.resetStrategies()
         await this.resetCells()
      }

      // strategyItem UI - update lastStrategyItem
      if (this.latestStrategyItem !== null) {
         this.latestStrategyItem.setState({ isCurrentStrategy: false })
         await forComponentsToUpdate()
      }

      if (this.strategyItemElements[this.strategyIndex] === undefined) {
         console.warn(`undefined strategyItemElement @${this.strategyIndex}`)
         window._custom.alert(
            "The code somehow can't find the Strategy Item", AlertType.ERROR
         )
         this.latestStrategyItem = null
      } else {
         this.latestStrategyItem = this.strategyItemElements[this.strategyIndex] as StrategyItem

         // Don't run strategy if it's disabled,
         // instead move on to the next strategy
         if (this.latestStrategyItem.state.disabled) {
            this.updateCounters(false, false)
            this.isDoingStep = false // Set back in the next step
            await forComponentsToUpdate() // currently unneccessary
            return this.Step()
         }

         // Not disabled, so update state
         this.latestStrategyItem.setState({
            isCurrentStrategy: true
         })
         await forComponentsToUpdate()
      }

      // Set cells to strategy mode
      await this.setupCells()

      // Run strategy
      const strategyResult = Strategies[this.strategyIndex](this.sudoku, this)

      // Set cells to non-strategy mode if failed
      if (strategyResult.success === false) {
         await this.resetCells()
      }

      // strategyItem UI - update lastStrategyItem state
      if (this.latestStrategyItem !== null) {
         const newState = {
            success: strategyResult.success,
            successcount: strategyResult.successcount ?? null
         } as const

         if (newState.successcount === SuccessError) {
            this.erroring = true
         }
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
      return;
   }

   /** Does "Step" until it reaches the end or a strategy succeeds */
   async Go() {
      do {
         await this.Step()
      } while (this.strategyIndex !== 0)
   }

   async Undo() {
      if (this.sudoku === null) return;
      for (const row of this.sudoku.cells) {
         for (const cell of row) {
            cell?.undo()
            cell?.setState({ explaining: false, previousCandidates: null })
         }
      }
      await forComponentsToUpdate()
   }

   async Import() {
      const result = await asyncPrompt("Enter data (todo: clarify)")
      if (result === null || result === "") {
         return; // Maybe do something else
      }

      await this.resetCells()
      this.sudokuNullCheck()
      this.sudoku.import(result)
      this.erroring = false
      this.solved = 0
      this.stepsTodo = 0
      this.strategyIndex = 0
   }

   Clear() {
      this.sudokuNullCheck()
      this.sudoku.clear()
      this.erroring = false
      this.solved = 0
      this.stepsTodo = 0
      this.strategyIndex = 0
   }
}
