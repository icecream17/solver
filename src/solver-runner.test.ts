import { WorkerSolverRunner, type SolverResponse } from './solver-runner'
import { createSession } from './core/session'

class FakeWorker {
   static readonly instances: FakeWorker[] = []
   onmessage: ((event: MessageEvent<SolverResponse>) => void) | null = null
   onerror: (() => void) | null = null
   onmessageerror: (() => void) | null = null
   terminate = vi.fn()
   postMessage = vi.fn()

   constructor() {
      FakeWorker.instances.push(this)
   }
   message(data: unknown) {
      this.onmessage?.({ data } as MessageEvent<SolverResponse>)
   }
}

beforeEach(() => {
   FakeWorker.instances.length = 0
   vi.stubGlobal('Worker', FakeWorker)
})
afterEach(() => vi.unstubAllGlobals())

test('progress does not finish a request, and a result terminates its worker', async () => {
   const runner = new WorkerSolverRunner()
   const progress = vi.fn()
   const operation = runner.run(createSession(), 'go', progress)
   const worker = FakeWorker.instances[0]
   worker.message({ progress: 'Hidden singles' })
   expect(progress).toHaveBeenCalledWith('Hidden singles')
   expect(worker.terminate).not.toHaveBeenCalled()
   worker.message({ session: createSession() })
   await operation
   expect(worker.terminate).toHaveBeenCalledOnce()
})

test('cancellation rejects the request and ignores stale events after a new request', async () => {
   const runner = new WorkerSolverRunner()
   const first = runner.run(createSession(), 'go')
   const stale = FakeWorker.instances[0]
   const lateMessage = stale.onmessage!
   const lateError = stale.onerror!
   const second = runner.run(createSession(), 'step')
   await expect(first).rejects.toHaveProperty('name', 'AbortError')
   lateMessage({ data: { session: createSession() } } as MessageEvent<SolverResponse>)
   lateError()
   expect(stale.terminate).toHaveBeenCalledOnce()
   expect(FakeWorker.instances[1].terminate).not.toHaveBeenCalled()
   FakeWorker.instances[1].message({ session: createSession() })
   await second
})

test('both computation and transport failures reject without keeping a worker alive', async () => {
   const runner = new WorkerSolverRunner()
   const computation = runner.run(createSession(), 'go')
   FakeWorker.instances[0].message({ error: 'Strategy failed' })
   await expect(computation).rejects.toThrow('Strategy failed')
   const transport = runner.run(createSession(), 'go')
   FakeWorker.instances[1].onerror?.()
   await expect(transport).rejects.toThrow('worker failed')
   expect(FakeWorker.instances[1].terminate).toHaveBeenCalledOnce()
})

test('unreadable worker messages reject and release the worker', async () => {
   const runner = new WorkerSolverRunner()
   const operation = runner.run(createSession(), 'step')
   const worker = FakeWorker.instances[0]
   worker.onmessageerror?.()
   await expect(operation).rejects.toThrow('worker failed')
   expect(worker.terminate).toHaveBeenCalledOnce()
})

test('a synchronous send failure rejects and releases the worker', async () => {
   const runner = new WorkerSolverRunner()
   const failingSend = vi.fn(() => {
      throw new Error('Cannot clone request')
   })
   vi.stubGlobal(
      'Worker',
      class extends FakeWorker {
         postMessage = failingSend
      }
   )
   await expect(runner.run(createSession(), 'step')).rejects.toThrow('Cannot clone request')
   expect(FakeWorker.instances[0].terminate).toHaveBeenCalledOnce()
})

test('constructor failure leaves cancellation harmless and a later request usable', async () => {
   const runner = new WorkerSolverRunner()
   vi.stubGlobal(
      'Worker',
      class {
         constructor() {
            throw new Error('Cannot create worker')
         }
      }
   )
   await expect(runner.run(createSession(), 'step')).rejects.toThrow('Cannot create worker')
   runner.cancel()
   vi.stubGlobal('Worker', FakeWorker)
   const next = runner.run(createSession(), 'step')
   FakeWorker.instances[0].message({ session: createSession() })
   await next
})

test.each([
   { name: 'null', message: null },
   { name: 'unknown', message: {} },
   { name: 'invalid progress', message: { progress: 1 } },
   { name: 'ambiguous', message: { progress: 'x', session: createSession() } }
])('$name message rejects rather than leaving a pending request', async ({ message }) => {
   const runner = new WorkerSolverRunner()
   const operation = runner.run(createSession(), 'step')
   const worker = FakeWorker.instances[0]
   worker.message(message)
   await expect(operation).rejects.toThrow('invalid response')
   expect(worker.terminate).toHaveBeenCalledOnce()
   expect(worker.onmessage).toBeNull()
   runner.cancel()
   expect(worker.terminate).toHaveBeenCalledOnce()
})

test('a progress callback failure releases only its owning request', async () => {
   const runner = new WorkerSolverRunner()
   const operation = runner.run(createSession(), 'step', () => {
      throw new Error('Progress callback failed')
   })
   FakeWorker.instances[0].message({ progress: 'Check for solved' })
   await expect(operation).rejects.toThrow('Progress callback failed')
   expect(FakeWorker.instances[0].terminate).toHaveBeenCalledOnce()
})

test('late progress and duplicate terminal callbacks cannot affect a newer request', async () => {
   const runner = new WorkerSolverRunner()
   const first = runner.run(createSession(), 'step')
   const worker = FakeWorker.instances[0]
   const queued = worker.onmessage!
   worker.message({ session: createSession() })
   await first
   const progress = vi.fn()
   const second = runner.run(createSession(), 'go', progress)
   queued({ data: { progress: 'Stale progress' } } as MessageEvent<SolverResponse>)
   queued({ data: { session: createSession() } } as MessageEvent<SolverResponse>)
   expect(progress).not.toHaveBeenCalled()
   expect(FakeWorker.instances[1].terminate).not.toHaveBeenCalled()
   FakeWorker.instances[1].message({ session: createSession() })
   await second
   expect(worker.terminate).toHaveBeenCalledOnce()
})
