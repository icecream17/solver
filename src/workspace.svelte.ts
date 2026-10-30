import { catalog } from './core/catalog'
import { ALL_CANDIDATES, type SudokuDigits } from './core/types'
import {
   createSession,
   importGrid,
   copyGrid,
   sameGrid,
   type Session,
   type Grid
} from './core/session'
import { WorkerSolverRunner, type SolverRunner, type SolveMode } from './solver-runner'

/** Svelte owns the reactive boundary. The domain layer is ordinary TypeScript. */
export class Workspace {
   session = $state<Session>(createSession())
   selected = $state<number[]>([])
   selectionActive = $state(false)
   // An untouched all-nine cell starts a new entry on its next digit, rather than
   // toggling that digit out of all nine. This is bookkeeping, not render state.
   // eslint-disable-next-line svelte/prefer-svelte-reactivity
   private fresh = new Set<number>()
   private history: Session[] = []
   canUndo = $state(false)
   private activeOperation = $state.raw<object | null>(null)
   operationMessage = $state('')

   constructor(private runner: SolverRunner = new WorkerSolverRunner()) {}

   get busy() {
      return this.activeOperation !== null
   }

   private refreshEntryState() {
      // eslint-disable-next-line svelte/prefer-svelte-reactivity -- private entry bookkeeping
      this.fresh = new Set(
         this.selected.filter((id) => this.session.grid[Math.floor(id / 9)][id % 9].length === 9)
      )
   }

   private remember() {
      this.history.push($state.snapshot(this.session))
      if (this.history.length > 100) this.history.shift()
      this.canUndo = true
   }

   select(index: number, extend = false) {
      if (extend || (!this.selectionActive && this.selected.includes(index))) {
         if (!this.selected.includes(index)) this.selected = [...this.selected, index]
      } else {
         this.selected = [index]
      }
      this.selectionActive = true
      this.refreshEntryState()
   }

   deactivate() {
      this.selectionActive = false
   }

   deselect() {
      this.selected = []
      this.selectionActive = false
      this.fresh.clear()
   }

   selectAll() {
      this.selected = Array.from({ length: 81 }, (_, index) => index)
      this.selectionActive = true
      this.refreshEntryState()
   }

   moveSelection(move: (index: number) => number) {
      // eslint-disable-next-line svelte/prefer-svelte-reactivity -- temporary deduplication, not state
      this.selected = [...new Set(this.selected.map(move))]
      this.selectionActive = true
      this.refreshEntryState()
   }

   edit(digit: SudokuDigits | 'reset' | 'empty') {
      if (!this.selected.length) return
      this.cancelSolve()
      this.operationMessage = ''
      const grid = copyGrid(this.session.grid)
      for (const id of this.selected) {
         const row = Math.floor(id / 9),
            column = id % 9
         if (digit === 'reset' || digit === 'empty') {
            grid[row][column] = digit === 'reset' ? [...ALL_CANDIDATES] : []
            if (digit === 'reset') this.fresh.add(id)
            else this.fresh.delete(id)
         } else {
            const current = this.fresh.has(id) ? [] : grid[row][column]
            grid[row][column] = current.includes(digit)
               ? current.filter((value) => value !== digit)
               : [...current, digit].sort((a, b) => a - b)
            this.fresh.delete(id)
         }
      }
      if (!sameGrid(grid, this.session.grid)) {
         this.remember()
         this.session = createSession(grid, this.session.disabled)
      }
   }

   async solve(mode: SolveMode) {
      if (this.busy) return
      const operation = {}
      this.activeOperation = operation
      this.operationMessage = 'Solving… You can cancel a long search.'

      try {
         const result = await this.runner.run($state.snapshot(this.session), mode, (strategy) => {
            if (operation === this.activeOperation)
               this.operationMessage = `Trying ${strategy}… You can cancel this search.`
         })
         // A board edit, cancellation, or newer request invalidates an old result.
         if (operation !== this.activeOperation) return
         if (!sameGrid(this.session.grid, result.grid)) this.remember()
         this.session = result
         this.operationMessage = ''
         // Navigation during work remains current. Only discard first-entry intent
         // where the result narrowed that cell; untouched all-nine entries keep it.
         for (const index of this.fresh) {
            if (this.session.grid[Math.floor(index / 9)][index % 9].length !== 9)
               this.fresh.delete(index)
         }
      } catch (error) {
         if (operation !== this.activeOperation) return
         const message = error instanceof Error ? error.message : String(error)
         this.operationMessage = message.trim()
            ? message
            : 'Solving failed. The board has not changed.'
      } finally {
         if (operation === this.activeOperation) this.activeOperation = null
      }
   }

   cancelSolve() {
      if (!this.busy) return
      this.activeOperation = null
      this.runner.cancel()
      this.operationMessage = 'Solving cancelled. The board has not changed.'
   }

   toggleStrategy(index: number, enabled: boolean) {
      if (catalog[index].required) return
      this.cancelSolve()
      this.operationMessage = ''
      this.session.disabled[index] = !enabled
      this.restartScan()
   }

   private restartScan() {
      this.session.strategyIndex = 0
      this.session.skippable.fill(false)
   }

   import(text: string) {
      const result = importGrid(text)
      if (!result) return false
      this.replace(result.grid)
      return true
   }

   clear() {
      this.replace(createSession().grid)
   }

   private replace(grid: Grid) {
      this.cancelSolve()
      this.operationMessage = ''
      if (!sameGrid(this.session.grid, grid)) this.remember()
      this.session = createSession(grid, this.session.disabled)
      this.deselect()
   }

   undo() {
      this.cancelSolve()
      this.operationMessage = ''
      const previous = this.history.pop()
      if (previous) {
         // Scan caches belong to the preferences that produced the snapshot.
         const preferencesChanged = previous.disabled.some(
            (disabled, index) => disabled !== this.session.disabled[index]
         )
         this.session = {
            ...previous,
            disabled: [...this.session.disabled]
         }
         if (preferencesChanged) this.restartScan()
         this.refreshEntryState()
      }
      this.canUndo = this.history.length > 0
   }
}
