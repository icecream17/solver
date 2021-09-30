import asyncPrompt from "../asyncPrompt"
import SolverPart from "../Elems/AsideElems/SolverPart"
import StrategyItem from "../Elems/AsideElems/StrategyItem"
import { AlertType, _Callback } from "../Types"
import { forComponentsToUpdate } from "../utils"
import STRATEGIES from "./Strategies/Strategies"
import Sudoku from "./Spaces/Sudoku"
import { SuccessError, StrategyMemory } from "./Types"
import React from "react"

function asyncSetState<T extends React.Component>(component: T, state: Readonly<Parameters<T["setState"]>[0]>) {
   return new Promise<undefined>(resolve => {
      component.setState(state, () => resolve(undefined))
   })
}

/**
 * A strategy is skippable if
 * 1. It failed
 * 2. It's retried with no changes
 */
export default class Solver {
   strategyIndex = 0
   latestStrategyItem: null | StrategyItem = null

   /** When a strategyItem is about to unmount, the strategy item element is deleted. */
   strategyItemElements: Array<StrategyItem | undefined> = []

   /** Used so that when there are multiple steps at the same time, the latter steps can wait */
   whenStepHasFinished: _Callback[] = []
   isDoingStep = false
   stepsTodo = 0

   /** Whether the most recent strategy has errored */
   erroring = false

   /** Information strategies keep across calls */
   memory = new StrategyMemory()

   /** Whether a strategy is skippable */
   skippable = [] as boolean[]

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
    * !async
    *
    * Called after the last strategy is done,
    * and just before the first strategy is done.
    */
   resetStrategies() {
      const promises = [] as Array<Promise<undefined>>
      for (const strategyElement of this.strategyItemElements) {
         if (strategyElement === undefined) {
            console.warn(`undefined strategyItemElement @resetStrategies`)
            continue;
         }

         promises.push(asyncSetState(strategyElement, {
            success: null,
            successcount: null
         }))
      }

      return Promise.allSettled(promises)
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
         if (this.strategyIndex === STRATEGIES.length) {
            this.strategyIndex = 0
         }
      }

      // Exception 3
      while (this.skippable[this.strategyIndex] && this.strategyIndex !== 0) {
         this.strategyIndex++
         if (this.strategyIndex === STRATEGIES.length) {
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

   // *async
   setupCells() {
      const promises = [] as Promise<undefined>[]

      this.sudokuNullCheck()
      for (const row of this.sudoku.cells) {
         for (const cell of row) {
            promises.push(new Promise(resolve => {
               cell?.setExplainingToTrue(resolve) ?? resolve(undefined)
            }))
         }
      }

      return Promise.allSettled(promises)
   }

   /**
    * !async
    *
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

   private async StartStep () {
      await forComponentsToUpdate()

      this.isDoingStep = true

      // See resetStrategies documentation
      if (this.strategyIndex === 0) {
         await this.resetStrategies()
         await this.resetCells()
      }

      // strategyItem UI - update lastStrategyItem
      if (this.latestStrategyItem !== null) {
         await asyncSetState(this.latestStrategyItem, { isCurrentStrategy: false })
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
            return this.Step() // Return other step promise
         }

         // Not disabled, so update state
         this.latestStrategyItem.setState({
            isCurrentStrategy: true
         })
         await forComponentsToUpdate()
      }

      // Set cells to strategy mode
      await this.setupCells()
   }

   private async FinishStep (strategyResult: {
      success: boolean
      successcount: number | null
   }) {
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

      this.isDoingStep = false
   }

   // This is a big function.
   // Each comment labels a group of code that does something

   // Originally Promise<undefined>
   async Step(): Promise<void> {
      this.erroring = false

      // Code for multiple steps at the same time
      if (this.isDoingStep) {
         this.stepsTodo++

         // Wait for the current step to finish
         // After that, continue to the main code
         await new Promise(resolve => {
            this.whenStepHasFinished.push(resolve)
         });
      }

      // Main code
      await this.StartStep()

      this.sudokuNullCheck()

      // Run strategy
      const _strategyResult = STRATEGIES[this.strategyIndex](this.sudoku, this.memory[this.strategyIndex])
      const strategyResult = {
         success: _strategyResult.success,
         successcount: "successcount" in _strategyResult ? _strategyResult.successcount ?? null : null
      }

      await this.FinishStep(strategyResult)

      // Code for multiple steps at the same time
      if (this.stepsTodo > 0) {
         this.stepsTodo--
         this.whenStepHasFinished[0]()
      }
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
