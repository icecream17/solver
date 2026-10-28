import { WorkerSolverRunner, type SolverResponse } from './solver-runner'
import { createSession } from './core/session'

class FakeWorker {
   static readonly instances: FakeWorker[] = []
   onmessage: ((event: MessageEvent<SolverResponse>) => void) | null = null
   onerror: (() => void) | null = null
   terminate = vi.fn()
   postMessage = vi.fn()

   constructor() { FakeWorker.instances.push(this) }
   message(data: SolverResponse) { this.onmessage?.({ data } as MessageEvent<SolverResponse>) }
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
   const second = runner.run(createSession(), 'step')
   await expect(first).rejects.toHaveProperty('name', 'AbortError')
   stale.message({ session: createSession() })
   stale.onerror?.()
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
