import type { Session } from './core/session'

export type SolveMode = 'step' | 'go'

export interface SolverRunner {
   run(session: Session, mode: SolveMode, onProgress?: (strategy: string) => void): Promise<Session>
   cancel(): void
}

export type SolverRequest = { session: Session; mode: SolveMode }
export type SolverResponse = { session: Session } | { error: string } | { progress: string }

type ActiveSolve = { worker: Worker; reject: (error: Error) => void }

/** Own one active worker; release it on completion, failure or cancellation. */
export class WorkerSolverRunner implements SolverRunner {
   private active: ActiveSolve | null = null

   run(
      session: Session,
      mode: SolveMode,
      onProgress?: (strategy: string) => void
   ): Promise<Session> {
      this.cancel()

      return new Promise((resolve, reject) => {
         const worker = new Worker(new URL('./core/solver.worker.ts', import.meta.url), {
            type: 'module'
         })
         const operation = { worker, reject }
         this.active = operation
         const fail = (error: Error) => {
            if (this.release(operation)) reject(error)
         }

         worker.onmessage = (event: MessageEvent<SolverResponse>) => {
            if (this.active !== operation) return
            try {
               const response = event.data
               if (!response || typeof response !== 'object' || Object.keys(response).length !== 1)
                  throw new Error('The solver worker returned an invalid response.')
               if ('progress' in response && typeof response.progress === 'string') {
                  onProgress?.(response.progress)
               } else if ('error' in response && typeof response.error === 'string') {
                  fail(new Error(response.error))
               } else if ('session' in response && response.session) {
                  if (this.release(operation)) resolve(response.session)
               } else {
                  throw new Error('The solver worker returned an invalid response.')
               }
            } catch (error) {
               fail(error instanceof Error ? error : new Error(String(error)))
            }
         }
         worker.onerror = worker.onmessageerror = () => {
            fail(new Error('The solver worker failed. The board has not changed.'))
         }
         try {
            worker.postMessage({ session, mode } satisfies SolverRequest)
         } catch (error) {
            fail(error instanceof Error ? error : new Error(String(error)))
         }
      })
   }

   cancel() {
      const operation = this.active
      if (operation && this.release(operation))
         operation.reject(new DOMException('Solving cancelled.', 'AbortError'))
   }

   private release(operation: ActiveSolve) {
      if (this.active !== operation) return false
      this.active = null
      const { worker } = operation
      worker.onmessage = worker.onerror = worker.onmessageerror = null
      worker.terminate()
      return true
   }
}
