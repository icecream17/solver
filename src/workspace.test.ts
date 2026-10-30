import { Workspace } from './workspace.svelte'
import fixtures from './core/fixtures'
import { createSession, copyGrid, go, step, type Session } from './core/session'
import type { SolverRunner, SolveMode } from './solver-runner'

const inlineRunner: SolverRunner = {
   run: async (session, mode) => (mode === 'step' ? step : go)(session),
   cancel() {}
}

type PendingSolve = {
   session: Session
   mode: SolveMode
   resolve: (session: Session) => void
   reject: (error: unknown) => void
   progress: (strategy: string) => void
}

// Deliberately permits late delivery after cancel, to test Workspace's own ownership guard.
class ControlledRunner implements SolverRunner {
   readonly requests: PendingSolve[] = []
   cancel = vi.fn()
   get resolve() {
      return this.requests.at(-1)!.resolve
   }
   get reject() {
      return this.requests.at(-1)!.reject
   }
   get progress() {
      return this.requests.at(-1)!.progress
   }

   run(session: Session, mode: SolveMode, onProgress?: (strategy: string) => void) {
      return new Promise<Session>((resolve, reject) => {
         this.requests.push({ session, mode, resolve, reject, progress: onProgress ?? (() => {}) })
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

test('undo restarts scanning if strategy preferences changed after the snapshot', async () => {
   const workspace = new Workspace(inlineRunner)
   workspace.import('1' + '.'.repeat(80))
   workspace.toggleStrategy(1, false)
   await workspace.solve('step')
   expect(workspace.session.strategyIndex).toBe(2)
   workspace.select(1)
   workspace.edit(2)
   workspace.toggleStrategy(1, true)
   workspace.undo()
   expect(workspace.session.disabled[1]).toBe(false)
   expect(workspace.session.strategyIndex).toBe(0)
   await workspace.solve('go')
   expect(workspace.session.results[1]).toMatchObject({ success: true, successcount: 20 })
})

test('completion preserves a selection made during work and its first-entry intent', async () => {
   const runner = new ControlledRunner()
   const workspace = new Workspace(runner)
   const operation = workspace.solve('go')
   workspace.select(1)
   runner.resolve(step(createSession()))
   await operation
   expect(workspace.selected).toEqual([1])
   expect(workspace.selectionActive).toBe(true)
   workspace.edit(7)
   expect(workspace.session.grid[0][1]).toEqual([7])
})

test('completion reconciles first-entry intent when the selected cell changed', async () => {
   const runner = new ControlledRunner()
   const workspace = new Workspace(runner)
   const operation = workspace.solve('go')
   workspace.select(1)
   const result = createSession()
   result.grid[0][1] = [2, 3]
   runner.resolve(result)
   await operation
   workspace.edit(2)
   expect(workspace.session.grid[0][1]).toEqual([3])
})

test('an unchanged result preserves an explicitly entered all-nine candidate set', async () => {
   const workspace = new Workspace(inlineRunner)
   workspace.select(0)
   for (const digit of [1, 2, 3, 4, 5, 6, 7, 8, 9] as const) workspace.edit(digit)
   await workspace.solve('step')
   workspace.edit(1)
   expect(workspace.session.grid[0][0]).toEqual([2, 3, 4, 5, 6, 7, 8, 9])
})

const invalidatingActions = [
   {
      name: 'edit',
      apply: (workspace: Workspace) => {
         workspace.select(1)
         workspace.edit(7)
      }
   },
   { name: 'clear', apply: (workspace: Workspace) => workspace.clear() },
   { name: 'import', apply: (workspace: Workspace) => workspace.import('2' + '.'.repeat(80)) },
   { name: 'undo', apply: (workspace: Workspace) => workspace.undo() },
   { name: 'toggle strategy', apply: (workspace: Workspace) => workspace.toggleStrategy(1, false) }
]

describe.each(invalidatingActions)('$name invalidates active work', ({ name, apply }) => {
   test.each(['result', 'error'])(
      'late %s cannot change committed state or history',
      async (terminal) => {
         const runner = new ControlledRunner()
         const workspace = new Workspace(runner)
         workspace.import('1' + '.'.repeat(80))
         const priorGrid = copyGrid(workspace.session.grid)
         const operation = workspace.solve('go')
         const request = runner.requests[0]
         apply(workspace)
         const expected = JSON.stringify(workspace.session)
         const message = workspace.operationMessage,
            canUndo = workspace.canUndo
         request.progress('Stale progress')
         const stale = createSession()
         stale.grid[0][0] = [8]
         if (terminal === 'result') request.resolve(stale)
         else request.reject(new Error('Stale failure'))
         await operation
         expect(JSON.stringify(workspace.session)).toBe(expected)
         expect(workspace.operationMessage).toBe(message)
         expect(workspace.canUndo).toBe(canUndo)
         expect(workspace.busy).toBe(false)
         expect(runner.cancel).toHaveBeenCalledOnce()
         workspace.undo()
         expect(workspace.session.grid).toEqual(
            name === 'undo' || name === 'toggle strategy' ? createSession().grid : priorGrid
         )
      }
   )
})

test.each(['result', 'error'])(
   'an old %s/finally cannot clear a newer operation',
   async (terminal) => {
      const runner = new ControlledRunner()
      const workspace = new Workspace(runner)
      const first = workspace.solve('go')
      const old = runner.requests[0]
      workspace.cancelSolve()
      const second = workspace.solve('step')
      const current = runner.requests[1]
      current.progress('Current strategy')
      old.progress('Stale strategy')
      if (terminal === 'result') old.resolve(createSession())
      else old.reject(new Error('Stale error'))
      await first
      expect(workspace.busy).toBe(true)
      expect(workspace.operationMessage).toContain('Current strategy')
      current.resolve(step(createSession()))
      await second
      expect(workspace.busy).toBe(false)
      expect(workspace.session.lastStrategy).toBe(0)
   }
)

test('overlapping Solve is ignored and invalid import leaves work running', async () => {
   const runner = new ControlledRunner()
   const workspace = new Workspace(runner)
   const operation = workspace.solve('go')
   await workspace.solve('step')
   expect(runner.requests).toHaveLength(1)
   expect(workspace.import('not a puzzle')).toBe(false)
   expect(workspace.busy).toBe(true)
   expect(runner.cancel).not.toHaveBeenCalled()
   runner.resolve(step(createSession()))
   await operation
})

test('an already resolved transport cannot commit after a mutation before the await resumes', async () => {
   const runner = new ControlledRunner()
   const workspace = new Workspace(runner)
   const operation = workspace.solve('go')
   const result = createSession()
   result.grid[0][0] = [8]
   runner.resolve(result)
   workspace.select(0)
   workspace.edit(7)
   await operation
   expect(workspace.session.grid[0][0]).toEqual([7])
   expect(workspace.busy).toBe(false)
   workspace.undo()
   expect(workspace.session.grid[0][0]).toHaveLength(9)
   expect(workspace.canUndo).toBe(false)
})

test('an error with no message still produces visible failure feedback', async () => {
   const runner = new ControlledRunner()
   const workspace = new Workspace(runner)
   const operation = workspace.solve('step')
   runner.reject(new Error(''))
   await operation
   expect(workspace.operationMessage).toContain('failed')
   expect(workspace.busy).toBe(false)
   expect(workspace.session.grid[0][0]).toHaveLength(9)
   expect(workspace.canUndo).toBe(false)
})
