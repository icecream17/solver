import { catalog } from './core/catalog'
import { ALL_CANDIDATES, type SudokuDigits } from './core/types'
import { createSession, importGrid, copyGrid, sameGrid, type Session, type Grid } from './core/session'
import { WorkerSolverRunner, type SolverRunner, type SolveMode } from './solver-runner'

/** Svelte owns the reactive boundary. The domain layer is ordinary TypeScript. */
export class Workspace {
   session = $state<Session>(createSession())
   selected = $state<number[]>([])
   selectionActive = $state(false)
   // Entry bookkeeping is not rendered; updates go through edit()/selection methods.
   // eslint-disable-next-line svelte/prefer-svelte-reactivity
   private fresh = new Set<number>()
   private history: Session[] = []
   canUndo = $state(false)
   busy = $state(false)
   operationMessage = $state('')
   private operation = 0

   constructor(private runner: SolverRunner = new WorkerSolverRunner()) {}

   private refreshEntryState() {
      // eslint-disable-next-line svelte/prefer-svelte-reactivity -- private entry bookkeeping
      this.fresh = new Set(this.selected.filter(id => this.session.grid[Math.floor(id / 9)][id % 9].length === 9))
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

   deactivate() { this.selectionActive = false }

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
         const row = Math.floor(id / 9), column = id % 9
         if (digit === 'reset' || digit === 'empty') {
            grid[row][column] = digit === 'reset' ? [...ALL_CANDIDATES] : []
            if (digit === 'reset') this.fresh.add(id)
            else this.fresh.delete(id)
         } else {
            const current = this.fresh.has(id) ? [] : grid[row][column]
            grid[row][column] = current.includes(digit)
               ? current.filter(value => value !== digit)
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
      const operation = ++this.operation
      this.busy = true
      this.operationMessage = 'Solving… You can cancel a long search.'

      try {
         const result = await this.runner.run($state.snapshot(this.session), mode, strategy => {
            if (operation === this.operation) this.operationMessage = `Trying ${strategy}… You can cancel this search.`
         })
         // A board edit, cancellation, or newer request invalidates an old result.
         if (operation !== this.operation) return
         this.remember()
         this.session = result
         this.operationMessage = ''
         this.deactivate()
         this.fresh.clear()
      } catch (error) {
         if (operation !== this.operation) return
         this.operationMessage = error instanceof Error ? error.message : String(error)
      } finally {
         if (operation === this.operation) this.busy = false
      }
   }

   cancelSolve() {
      if (!this.busy) return
      this.operation++
      this.runner.cancel()
      this.busy = false
      this.operationMessage = 'Solving cancelled. The board has not changed.'
   }

   toggleStrategy(index: number, enabled: boolean) {
      if (catalog[index].required) return
      this.cancelSolve()
      this.operationMessage = ''
      this.session.disabled[index] = !enabled
      this.session.strategyIndex = 0
      this.session.skippable.fill(false)
   }

   import(text: string) {
      const result = importGrid(text)
      if (!result) return false
      this.replace(result.grid)
      return true
   }

   clear() { this.replace(createSession().grid) }

   private replace(grid: Grid) {
      this.cancelSolve()
      this.operationMessage = ''
      this.remember()
      this.session = createSession(grid, this.session.disabled)
      this.deselect()
   }

   undo() {
      this.cancelSolve()
      this.operationMessage = ''
      const previous = this.history.pop()
      if (previous) {
         // Strategy enablement is a preference, not part of board undo.
         this.session = { ...previous, disabled: [...this.session.disabled] }
         this.refreshEntryState()
      }
      this.canUndo = this.history.length > 0
   }
}
