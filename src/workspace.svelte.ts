import { catalog } from './core/catalog'
import { ALL_CANDIDATES, type SudokuDigits } from './core/types'
import { createSession, importGrid, copyGrid, sameGrid, step, go, type Session, type Grid } from './core/session'

/** Svelte owns the reactive boundary. The domain layer is ordinary TypeScript. */
export class Workspace {
   session = $state<Session>(createSession())
   selected = $state<number[]>([])
   selectionActive = $state(false)
   private fresh = new Set<number>()
   private history: Session[] = []
   canUndo = $state(false)

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
      this.fresh = new Set(this.selected.filter(id => this.session.grid[Math.floor(id / 9)][id % 9].length === 9))
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
      this.fresh = new Set(this.selected.filter(id => this.session.grid[Math.floor(id / 9)][id % 9].length === 9))
   }

   moveSelection(move: (index: number) => number) {
      this.selected = [...new Set(this.selected.map(move))]
      this.selectionActive = true
      this.fresh = new Set(this.selected.filter(id => this.session.grid[Math.floor(id / 9)][id % 9].length === 9))
   }

   edit(digit: SudokuDigits | 'reset' | 'empty') {
      if (!this.selected.length) return
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

   solve(mode: 'step' | 'go') {
      this.remember()
      this.session = (mode === 'step' ? step : go)($state.snapshot(this.session))
      this.deactivate()
      this.fresh.clear()
   }

   toggleStrategy(index: number, enabled: boolean) {
      if (!catalog[index].required) this.session.disabled[index] = !enabled
   }

   import(text: string) {
      const result = importGrid(text)
      if (!result) return false
      this.replace(result.grid)
      return true
   }

   clear() { this.replace(createSession().grid) }

   private replace(grid: Grid) {
      this.remember()
      this.session = createSession(grid, this.session.disabled)
      this.deselect()
   }

   undo() {
      const previous = this.history.pop()
      if (previous) {
         // Strategy enablement is a preference, not part of board undo.
         this.session = { ...previous, disabled: [...this.session.disabled] }
         this.fresh.clear()
      }
      this.canUndo = this.history.length > 0
   }
}
