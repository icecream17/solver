import asyncPrompt from "../asyncPrompt"
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

   /** When a StrategyItem is about to unmount, it deletes its reference here */
   strategyItemElements: Array<StrategyItem | undefined> = []

   /** Later steps wait for earlier steps to finish. Implemented using callback and promises */
   whenStepHasFinished: _Callback[] = []
   isDoingStep = false

   /** Whether the most recent strategy has errored */
   erroring = false

   /** Information strategies keep across calls */
   memory = new StrategyMemory()

   /** Whether a strategy is skippable */
   skippable = [] as boolean[]

   constructor(public sudoku: Sudoku) {
      // Bind the StrategyControl handlers which have capitzalized names
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
    * Called when starting a new {@link Solver.prototype.Go} of strategies, i.e. starting strategy 0.
    * Resets the StrategyResults in practice.
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
      // Go back to the start when a strategy succeeds, if erroring, or if finished
      // (exception 1: if you're at the start go to 1 anyways)
      // (exception 2:
      //    After "check for solved" fails,
      //    skip "update candidates"
      // )
      // (expection 3:
      //    If a strategy is skippable skip it
      // )
      if (success) {
         this.skippable.fill(false)
      } else {
         this.skippable[this.strategyIndex] = true
      }

      // if GoToStart
      // else if Exception2
      // else <normal condition + Exception1>
      if ((success && this.strategyIndex > 0) || this.erroring || isFinished) {
         this.strategyIndex = 0
      } else if (this.strategyIndex === 0 && success === false) {
         this.strategyIndex = 2
      } else {
         this.__step()
      }

      // Exception 3
      while (this.skippable[this.strategyIndex] && this.strategyIndex !== 0) {
         this.__step()
      }
   }

   private __step () {
      this.strategyIndex++
      if (this.strategyIndex === STRATEGIES.length) {
         this.strategyIndex = 0
      }
   }

   /**
    * *async
    */
   setupCells() {
      const promises = [] as Promise<undefined>[]

      for (const row of this.sudoku.cells) {
         for (const cell of row) {
            if (cell != null) {
               promises.push(new Promise(resolve => {
                  cell.setExplainingToTrue(resolve)
               }))
            }
         }
      }

      return Promise.allSettled(promises)
   }

   /**
    * !async
    *
    * !misnomer
    *
    * For each cell, run {@link Cell#setExplainingToFalse}
    */
   async resetCells() {
      for (const row of this.sudoku.cells) {
         for (const cell of row) {
            cell?.setExplainingToFalse()
         }
      }
      await forComponentsToUpdate()
   }

   private async StartStep (): Promise<void> {
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

         // If the StrategyItem unloaded, it's null, right?
         // e.g. when exiting the tab
         // esp. when finishing a test
         if (this.latestStrategyItem !== null) {
            this.latestStrategyItem = null
            console.error(`undefined strategyItemElement @${this.strategyIndex}`)
         }
      } else {
         this.latestStrategyItem = this.strategyItemElements[this.strategyIndex] as StrategyItem

         // Skip disabled strategies
         if (this.latestStrategyItem.state.disabled) {
            this.updateCounters(false, false)
            return this.StartStep()
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

      if (this.isDoingStep) {
         // Don't do this step yet
         // Wait for any previous steps to finish
         // After that, continue to the main code
         await new Promise(resolve => {
            this.whenStepHasFinished.push(resolve)
         });

         this.whenStepHasFinished.shift()
      }

      // Main code
      await this.StartStep()

      // Run strategy
      const _strategyResult = STRATEGIES[this.strategyIndex](this.sudoku, this.memory[this.strategyIndex])
      const strategyResult = {
         success: _strategyResult.success,
         successcount: "successcount" in _strategyResult ? _strategyResult.successcount ?? null : null
      }

      await this.FinishStep(strategyResult)

      // Do the next step if it's waiting for this one
      if (this.whenStepHasFinished.length > 0) {
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
            cell?.undo(() => {
               void this.sudoku
                  .set(cell.props.row, cell.props.column)
                  .to(...cell.state.candidates)
            })
         }
      }
      this.skippable[this.strategyIndex] = false
      await forComponentsToUpdate()
   }

   async Import() {
      const result = await asyncPrompt("Import", "Enter digits or candidates")
      if (result === null || result === "") {
         return; // Don't import on cancel
      }

      await this.reset()
      this.sudoku.import(result)
   }

   Export() {
      window._custom.alert(this.sudoku.to81())
      window._custom.alert(this.sudoku.to729())
   }

   async Clear() {
      this.sudoku.clear()
      await this.reset()
   }

   async reset() {
      // BUG: Doesn't wait for steps to finish
      await this.resetCells()
      this.erroring = false
      this.memory = new StrategyMemory()
      this.whenStepHasFinished = []
      this.strategyIndex = 0
      this.skippable = []
   }
}
