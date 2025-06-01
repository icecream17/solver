import asyncPrompt from "../asyncPrompt"
import EventRegistry from "../eventRegistry"
import { AlertType } from "../Types"
import { forComponentsToUpdate } from "../utils"
import Sudoku from "./Spaces/Sudoku"
import STRATEGIES from "./Strategies/Strategies"
import { SuccessError, StrategyMemory } from "./Types"
import { numberOfCellsWithNCandidates } from "./Utils.dependent"

type SolverEvents = 'new turn' | 'step finish'

/**
 * Keeps track of the solving strategies, and also implements a few commands
 * (Step, Go, Import, Export, Clear).
 */
export default class Solver {
   strategyIndex = 0

   /** Later steps wait for earlier steps to finish. Implemented using callback and promises */
   whenStepHasFinished: ((stop: boolean) => void)[] = []
   isDoingStep = false

   /** Information strategies keep across calls */
   memory = new StrategyMemory()

   /**
    * Whether a strategy is logically skippable (disabled does not apply).
    * Right now, all strategies are skippable if they're retried with no changes to the sudoku.
    */
   skippable = [] as boolean[]

   /** Which strategies are disabled (used by StrategyItems) */
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

   updateCounters (success: boolean, errored: boolean, solved: boolean) {
      if ((success && this.strategyIndex !== 0) || errored || solved) {
         // Go back to the start when a strategy succeeds, errors,
         // (or the sudoku is solved, because the user edited it or smth idk)
         this.strategyIndex = 0

         this.skippable.fill(false)

         // errored or solved
         if (!success) {
            return
         }
      }

      // Usually what happens here is that the strategy fails,
      // and is skipped. Which is practically the same as doing one step.

      // Exception: "check for solved" isn't really a strategy
      else if (this.strategyIndex === 0) {
         this.strategyIndex = 1 // sneaky, next if statement will skip "update candidates" iff "check for solved" failed
         this.skippable[0] = true // shouldn't matter, but set for clarity
      }

      if (!success) {
         this.skippable[this.strategyIndex] = true
      }

      while ((this.skippable[this.strategyIndex] || this.disabled[this.strategyIndex]) && this.strategyIndex !== 0) {
         this.__step()
      }
   }

   private __step () {
      this.strategyIndex++
      if (this.strategyIndex === STRATEGIES.length) {
         this.strategyIndex = 0
      }
   }

   private __promisifyCellMethod<T> (methodName: T & ("setExplainingToTrue" | "setExplainingToFalse")) {
      const promises = [] as Promise<undefined>[]

      for (const row of this.sudoku.cells) {
         for (const cell of row) {
            if (cell != null) {
               promises.push(new Promise(resolve => {
                  cell[methodName](resolve)
               }))
            }
         }
      }

      return Promise.allSettled(promises)
   }

   /**
    * !async
    */
   setupCells () {
      return this.__promisifyCellMethod("setExplainingToTrue")
   }

   /**
    * !async
    *
    * !misnomer
    *
    * For each cell, run {@link Cell#setExplainingToFalse}
    */
   resetCells () {
      return this.__promisifyCellMethod("setExplainingToFalse")
   }

   /**
    * Returns a boolean: "success" as in went to next strategy
    */
   private goToNextStrategyIfDisabled () {
      if (this.disabled[this.strategyIndex]) {
         this.updateCounters(false, false, false)
         return true
      }

      return false
   }

   private async StartStep (): Promise<void> {
      await forComponentsToUpdate()

      this.isDoingStep = true

      // This could theoretically go on forever, but right now the first
      // strategy cannot be disabled. TODO: Better solution

      // If current strat is disabled, go to first non-disabled strat.
      do {
         if (this.strategyIndex === 0) {
            this.eventRegistry.notify('new turn')
            await this.resetCells()
         }
      } while (this.goToNextStrategyIfDisabled())

      // Set cells to strategy mode
      await this.setupCells()
   }

   private async FinishStep (strategyResult: {
      success: boolean
      successcount: number | null
      message: string | null
   }) {
      // Set cells to non-strategy mode if failed
      if (strategyResult.success === false) {
         await this.resetCells()
      }

      // notify the strategyItem UI
      this.eventRegistry.notify('step finish', strategyResult, this.strategyIndex)
      await forComponentsToUpdate()

      // "check for solved" can return -1 without being an error
      // if the user edits the sudoku
      const errored = !strategyResult.success && strategyResult.successcount === SuccessError
      const solved = numberOfCellsWithNCandidates(this.sudoku, 1) === 81
      if (solved) {
         window._custom.alert("Finished! :D", AlertType.SUCCESS)
      }

      this.updateCounters(strategyResult.success, errored, solved)
      this.isDoingStep = false

      return errored || solved
   }

   // This is a big function.
   // Each comment labels a group of code that does something

   // Originally Promise<undefined>
   async Step (): Promise<void> {
      if (this.isDoingStep) {
         // Don't do this step yet
         // Wait for any previous steps to finish
         // After that, continue to the main code
         const stop = await new Promise<boolean>(resolve => {
            this.whenStepHasFinished.push(resolve)
         })

         this.whenStepHasFinished.shift()

         if (stop) {
            this.whenStepHasFinished[0]?.(stop)
            return
         }
      }

      // Main code
      await this.StartStep()

      // Run strategy
      const _strategyResult = STRATEGIES[this.strategyIndex](this.sudoku, this.memory[this.strategyIndex])
      const strategyResult = {
         success: _strategyResult.success,
         successcount: _strategyResult.successcount ?? null,
         message: _strategyResult.message ?? null,
      }

      const stop = await this.FinishStep(strategyResult)

      // Do the next step if it's waiting for this one
      this.whenStepHasFinished[0]?.(stop)
   }

   /** Does "Step" until it reaches the end or a strategy succeeds */
   async Go () {
      do {
         await this.Step()
      } while (this.strategyIndex !== 0)
   }

   async Undo () {
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

   async Import () {
      const result = await asyncPrompt("Import", "Enter digits or candidates")
      if (result === null || result === "") {
         return; // Don't import on cancel
      }

      await this.reset()
      this.sudoku.import(result)
   }

   Export () {
      window._custom.alert(this.sudoku.to81(), undefined, "monospace")
      window._custom.alert(this.sudoku.to729(), undefined, "monospace")
   }

   async Clear () {
      this.sudoku.clear()
      await this.reset()
   }

   async reset () {
      // BUG: Doesn't wait for steps to finish
      await this.resetCells()
      this.eventRegistry.notify('new turn')
      this.memory = new StrategyMemory()
      this.whenStepHasFinished = []
      this.strategyIndex = 0
      this.skippable = []
   }
}
