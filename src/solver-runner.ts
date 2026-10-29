import type { Session } from './core/session'

export type SolveMode = 'step' | 'go'

export interface SolverRunner {
   run(session: Session, mode: SolveMode, onProgress?: (strategy: string) => void): Promise<Session>
   cancel(): void
}

export type SolverRequest = { session: Session; mode: SolveMode }
export type SolverResponse = { session: Session } | { error: string } | { progress: string }

/** One worker per operation makes cancellation immediate, even inside a search. */
export class WorkerSolverRunner implements SolverRunner {
   private worker: Worker | null = null
   private reject: ((error: Error) => void) | null = null

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
         this.worker = worker
         this.reject = reject

         worker.onmessage = (event: MessageEvent<SolverResponse>) => {
            if (this.worker !== worker) return
            if ('progress' in event.data) {
               onProgress?.(event.data.progress)
               return
            }
            this.finish()
            if ('error' in event.data) reject(new Error(event.data.error))
            else resolve(event.data.session)
         }
         const fail = () => {
            if (this.worker !== worker) return
            this.finish()
            reject(new Error('The solver worker failed. The board has not changed.'))
         }
         worker.onerror = fail
         worker.onmessageerror = fail
         try {
            worker.postMessage({ session, mode } satisfies SolverRequest)
         } catch (error) {
            this.finish()
            reject(error)
         }
      })
   }

   cancel() {
      const reject = this.reject
      this.finish()
      reject?.(new DOMException('Solving cancelled.', 'AbortError'))
   }

   private finish() {
      this.worker?.terminate()
      this.worker = null
      this.reject = null
   }
}
