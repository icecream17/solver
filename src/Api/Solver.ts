import asyncPrompt from "../asyncPrompt"
import { _Callback } from "../Types"
import { forComponentsToUpdate } from "../utils"
import STRATEGIES from "./Strategies/Strategies"
import Sudoku from "./Spaces/Sudoku"
import { SuccessError, StrategyMemory } from "./Types"
import EventRegistry from "../eventRegistry"

type SolverEvents = 'new turn' | 'step finish'

/**
 * A strategy is skippable if
 * 1. It failed
 * 2. It's retried with no changes
 */
export default class Solver {
   strategyIndex = 0

   /** Later steps wait for earlier steps to finish. Implemented using callback and promises */
   whenStepHasFinished: _Callback[] = []
   isDoingStep = false

   /** Whether the most recent strategy has errored */
   erroring = false

   /** Information strategies keep across calls */
   memory = new StrategyMemory()

   /** Whether a strategy is skippable */
   skippable = [] as boolean[]

   /** Which strategies are disabled */
   disabled = [] as boolean[]

   /** Used to reset + update the StrategyItems */
   eventRegistry = new EventRegistry<SolverEvents>()

   constructor(public sudoku: Sudoku) {
      // Bind the StrategyControl handlers which have capitzalized names
      this.Go = this.Go.bind(this)
      this.Step = this.Step.bind(this)
      this.Undo = this.Undo.bind(this)
      this.Import = this.Import.bind(this)
      this.Export = this.Export.bind(this)
      this.Clear = this.Clear.bind(this)
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

   /**
    * Returns a boolean, "done"
    */
   private goToNextStrategyItem() {
      if (this.disabled[this.strategyIndex]) {
         this.updateCounters(false, false)
         return false
      }

      return true
   }

   private async StartStep (): Promise<void> {
      await forComponentsToUpdate()

      this.isDoingStep = true

      // This could theoretically go on forever, but right now the first
      // strategy cannot be disabled. TODO: Better solution
      do {
         if (this.strategyIndex === 0) {
            this.eventRegistry.notify('new turn')
            await this.resetCells()
         }

         // strategyItem UI - update lastStrategyItem
      } while (!this.goToNextStrategyItem())

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

      if (strategyResult.successcount === SuccessError) {
         this.erroring = true
      }

      // notify the strategyItem UI
      this.eventRegistry.notify('step finish', strategyResult, this.strategyIndex)
      await forComponentsToUpdate()

      this.updateCounters(strategyResult.success, strategyResult.successcount === 81)
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
