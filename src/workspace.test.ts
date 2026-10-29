import { Workspace } from './workspace.svelte'
import fixtures from './core/fixtures'
import { createSession, go, step, type Session } from './core/session'
import type { SolverRunner, SolveMode } from './solver-runner'

const inlineRunner: SolverRunner = {
   run: async (session, mode) => (mode === 'step' ? step : go)(session),
   cancel() {}
}

class ControlledRunner implements SolverRunner {
   resolve!: (session: Session) => void
   reject!: (error: unknown) => void
   progress!: (strategy: string) => void
   cancel = vi.fn()

   run(_session: Session, _mode: SolveMode, onProgress?: (strategy: string) => void) {
      this.progress = onProgress ?? (() => {})
      return new Promise<Session>((resolve, reject) => {
         this.resolve = resolve
         this.reject = reject
      })
   }
}

test('undo restores first-entry state while the same cell is selected', () => {
   const workspace = new Workspace(inlineRunner)
   workspace.select(0)
   workspace.edit(1)
   workspace.undo()
   workspace.edit(2)
   expect(workspace.session.grid[0][0]).toEqual([2])
})

test('one solver command can be undone with its board and cursor', async () => {
   const workspace = new Workspace(inlineRunner)
   workspace.select(0)
   workspace.edit(1)
   const before = JSON.stringify(workspace.session)
   await workspace.solve('go')
   expect(workspace.session.grid[0][1]).not.toContain(1)
   workspace.undo()
   expect(JSON.stringify(workspace.session)).toBe(before)
})

test('history is bounded to the last 100 board actions', () => {
   const workspace = new Workspace(inlineRunner)
   workspace.select(0)
   for (let edit = 0; edit < 150; edit++) workspace.edit(1)
   for (let undo = 0; undo < 100; undo++) workspace.undo()
   expect(workspace.canUndo).toBe(false)
})

test('a completed worker response applies once and reports progress', async () => {
   const runner = new ControlledRunner()
   const workspace = new Workspace(runner)
   const operation = workspace.solve('step')
   expect(workspace.busy).toBe(true)
   runner.progress('XY Ring (Loop)')
   expect(workspace.operationMessage).toContain('XY Ring')
   const result = step(createSession())
   runner.resolve(result)
   await operation
   expect(workspace.busy).toBe(false)
   expect(workspace.session.lastStrategy).toBe(0)
   expect(workspace.canUndo).toBe(false)
})

test('editing cancels work and a late response cannot replace the edited board', async () => {
   const runner = new ControlledRunner()
   const workspace = new Workspace(runner)
   const operation = workspace.solve('go')
   workspace.select(0)
   workspace.edit(7)
   runner.progress('Old progress')
   runner.resolve(createSession())
   await operation
   expect(runner.cancel).toHaveBeenCalledOnce()
   expect(workspace.session.grid[0][0]).toEqual([7])
   expect(workspace.operationMessage).not.toContain('Old progress')
})

test('cancellation and worker errors leave the board intact', async () => {
   const runner = new ControlledRunner()
   const workspace = new Workspace(runner)
   const cancelled = workspace.solve('go')
   workspace.cancelSolve()
   runner.reject(new DOMException('Cancelled', 'AbortError'))
   await cancelled
   expect(workspace.busy).toBe(false)
   expect(workspace.operationMessage).toContain('cancelled')

   const failed = workspace.solve('step')
   runner.reject(new Error('Worker failed'))
   await failed
   expect(workspace.operationMessage).toBe('Worker failed')
   expect(workspace.session.grid[0][0]).toHaveLength(9)
})

test('clear, import, strategy preferences, and required strategies remain coherent', async () => {
   const workspace = new Workspace(inlineRunner)
   workspace.toggleStrategy(0, false)
   expect(workspace.session.disabled[0]).toBe(false)
   workspace.import('1' + '.'.repeat(80))
   workspace.toggleStrategy(1, false)
   await workspace.solve('go')
   expect(workspace.session.outcome).toBe('stalled')
   workspace.toggleStrategy(1, true)
   await workspace.solve('go')
   expect(workspace.session.results[1]).toMatchObject({ success: true, successcount: 20 })
   workspace.clear()
   expect(workspace.selected).toHaveLength(0)
   expect(workspace.session.grid[0][0]).toHaveLength(9)
   expect(workspace.import('bad')).toBe(false)
})

test('unchanged solver results advance the cursor without consuming board history', async () => {
   const workspace = new Workspace(inlineRunner)
   await workspace.solve('step')
   expect(workspace.session.lastStrategy).toBe(0)
   expect(workspace.session.strategyIndex).toBe(1)
   expect(workspace.canUndo).toBe(false)
   workspace.select(0)
   workspace.edit(1)
   await workspace.solve('step')
   workspace.undo()
   expect(workspace.session.grid[0][0]).toHaveLength(9)
   expect(workspace.canUndo).toBe(false)
})

test('repeated solved checks preserve the preceding real undo action', async () => {
   const workspace = new Workspace(inlineRunner)
   workspace.import(fixtures['Solved board'])
   await workspace.solve('step')
   await workspace.solve('go')
   expect(workspace.session.outcome).toBe('solved')
   workspace.undo()
   expect(workspace.session.grid[0][0]).toHaveLength(9)
   expect(workspace.canUndo).toBe(false)
   workspace.clear()
   expect(workspace.canUndo).toBe(false)
})
