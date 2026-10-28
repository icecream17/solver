/// <reference lib="webworker" />
import { go, step } from './session'
import type { SolverRequest, SolverResponse } from '../solver-runner'

// The worker owns computation only; selection, history, and rendering stay in the UI.
self.onmessage = (event: MessageEvent<SolverRequest>) => {
   try {
      const { session, mode } = event.data
      const result = (mode === 'step' ? step : go)(session, (strategy) => {
         self.postMessage({ progress: strategy } satisfies SolverResponse)
      })
      self.postMessage({ session: result } satisfies SolverResponse)
   } catch (error) {
      self.postMessage({
         error: error instanceof Error ? error.message : String(error)
      } satisfies SolverResponse)
   }
}
