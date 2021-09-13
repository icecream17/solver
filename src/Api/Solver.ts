import asyncPrompt from "../asyncPrompt"
import SolverPart from "../Elems/AsideElems/SolverPart"
import StrategyItem from "../Elems/AsideElems/StrategyItem"
import { AlertType } from "../Types"
import { forComponentsToUpdate } from "../utils"
import Strategies from "./Strategies/Strategies"
import Sudoku from "./Spaces/Sudoku"
import { SuccessError, StrategyMemory } from "./Types"

/**
 * A strategy is skippable if
 * 1. It failed
 * 2. It's retried with no changes
 */
export default class Solver {
   latestStrategyItem: null | StrategyItem = null
   isDoingStep = false
   erroring = false
   memory = new StrategyMemory() // Information strategies keep across calls
   skippable = [] as boolean[]
   stepsTodo = 0
   strategyIndex = 0
   /** When a strategyItem is about to unmount, the strategy item element is deleted. */
   strategyItemElements: Array<StrategyItem | undefined> = []

   constructor(public sudoku: null | Sudoku = null, public solverElement: SolverPart) {
      // These capitalized methods are used as handlers in StrategyControls, so they need to be bound beforehand.
      this.Go = this.Go.bind(this)
      this.Step = this.Step.bind(this)
      this.Undo = this.Undo.bind(this)
      this.Import = this.Import.bind(this)
      this.Export = this.Export.bind(this)
      this.Clear = this.Clear.bind(this)
   }

   /**
    * Called after the last strategy is done,
    * and just before the first strategy is done.
    */
   resetStrategies(index = 0): void {
      if (index >= this.strategyItemElements.length) {
         return
      }

      const strategyElement = this.strategyItemElements[index]
      if (strategyElement === undefined) {
         console.warn(`undefined strategyItemElement @resetStrategies`)
         return this.resetStrategies(index + 1)
      }

      strategyElement.setState({
         success: null,
         successcount: null
      }, () => this.resetStrategies(index + 1))
   }

   updateCounters(success: boolean, isFinished: boolean) {
      // Go back to the start when a strategy succeeds
      // (exception 1: if you're at the start go to 1 anyways)
      // (exception 1a: if the sudoku is finished don't go to 1)
      // (exceotion 1b: always be at the start if erroring)
      // (exception 2:
      //    After "check for solved" fails,
      //    skip "update candidates"
      // )
      // (expection 3:
      //    If a strategy is skippable skip it
      // )
      if (success) {
         for (let i = 0; i < this.skippable.length; i++) {
            this.skippable[i] = false
         }
      } else {
         this.skippable[this.strategyIndex] = true
      }

      // if exception (not 1) / 1a / 1b
      // else if 2
      // else <normal condition>
      if ((success && this.strategyIndex > 0) || this.erroring || isFinished) {
         this.strategyIndex = 0
      } else if (this.strategyIndex === 0 && success === false) {
         this.strategyIndex = 2
      } else {
         this.strategyIndex++
         if (this.strategyIndex === Strategies.length) {
            this.strategyIndex = 0
         }
      }

      // Exception 3
      while (this.skippable[this.strategyIndex] && this.strategyIndex !== 0) {
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
            cell?.setExplainingToTrue()
         }
      }
      await forComponentsToUpdate()
   }

   /**
    * Kind of a misnomer really.
    *
    * For each cell, run {@link Cell#setExplainingToFalse}
    */
   async resetCells() {
      this.sudokuNullCheck()
      for (const row of this.sudoku.cells) {
         for (const cell of row) {
            cell?.setExplainingToFalse()
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
         this.resetStrategies()
         await this.resetCells()
      }

      // strategyItem UI - update lastStrategyItem
      if (this.latestStrategyItem !== null) {
         this.latestStrategyItem.setState({ isCurrentStrategy: false })
         await forComponentsToUpdate()
      }

      if (this.strategyItemElements[this.strategyIndex] === undefined) {
         window._custom.alert(
            "The code somehow can't find the Strategy Item", AlertType.ERROR
         )

         // Only error if not null.
         // Otherwise, this is only because the StrategyItem unloaded, e.g. when exiting the tab
         //    (Really because of tests)
         if (this.latestStrategyItem !== null) {
            this.latestStrategyItem = null
            console.error(`undefined strategyItemElement @${this.strategyIndex}`)
         }
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
      const _strategyResult = Strategies[this.strategyIndex](this.sudoku, this.memory[this.strategyIndex])
      const strategyResult = {
         success: _strategyResult.success,
         successcount: "successcount" in _strategyResult ? _strategyResult.successcount ?? null : null
      }

      // Set cells to non-strategy mode if failed
      if (strategyResult.success === false) {
         await this.resetCells()
      }

      // strategyItem UI - update lastStrategyItem state
      if (this.latestStrategyItem !== null) {
         if (strategyResult.successcount === SuccessError) {
            this.erroring = true
         }
         this.latestStrategyItem.setState(strategyResult)
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
      this.skippable[this.strategyIndex] = false
      await forComponentsToUpdate()
   }

   async Import() {
      const result = await asyncPrompt("Enter data (todo: clarify)")
      if (result === null || result === "") {
         return; // Maybe do something else
      }

      await this.reset()
      this.sudokuNullCheck()
      this.sudoku.import(result)
   }

   Export() {
      this.sudokuNullCheck()
      window._custom.alert(this.sudoku._to81())
      window._custom.alert(this.sudoku.to729())
   }

   async Clear() {
      this.sudokuNullCheck()
      this.sudoku.clear()
      await this.reset()
   }

   async reset() {
      await this.resetCells()
      this.erroring = false
      this.memory = new StrategyMemory()
      this.stepsTodo = 0
      this.strategyIndex = 0
      this.skippable = []
   }
}
