import Board from './board'
import { catalog } from './catalog'
import { StrategyMemory, SuccessError, type StrategyResult } from './strategy-types'
import type { SudokuDigits } from './types'
import checkValidity from './strategies/checkValidity'

import type { Annotations } from './marks'

export type Grid = SudokuDigits[][][]
export type { Annotations } from './marks'
export type Session = {
   grid: Grid
   previous: Grid | null
   annotations: Annotations
   strategyIndex: number
   lastStrategy: number | null
   results: (StrategyResult | null)[]
   disabled: boolean[]
   skippable: boolean[]
   solvedCount: number
   message: string
   outcome: 'ready' | 'progress' | 'stalled' | 'error' | 'solved'
}

export const copyGrid = (grid: Grid): Grid => grid.map((row) => row.map((cell) => [...cell]))
export const sameGrid = (a: Grid, b: Grid) =>
   a.every((row, r) =>
      row.every(
         (cell, c) =>
            cell.length === b[r][c].length && cell.every((digit) => b[r][c].includes(digit))
      )
   )

export function createSession(
   grid: Grid = new Board().data,
   disabled = catalog.map(() => false)
): Session {
   return {
      grid: copyGrid(grid),
      previous: null,
      annotations: {},
      strategyIndex: 0,
      lastStrategy: null,
      results: catalog.map(() => null),
      disabled: [...disabled],
      skippable: catalog.map(() => false),
      solvedCount: 0,
      message: '',
      outcome: 'ready'
   }
}

export function importGrid(text: string): { grid: Grid; format: string } | null {
   if (!text.trim()) return null
   const board = new Board()
   const result = board.import(text)
   return result.success
      ? {
           grid: board.data,
           format: result.representationType
        }
      : null
}

export function exportGrid(grid: Grid) {
   const board = new Board()
   board.data = copyGrid(grid)
   return {
      digits: board.to81(),
      candidates: board.to729()
   }
}

/** One synchronous domain operation. Rendering and timing are the caller's choice. */
export function step(session: Session, onStrategy?: (strategy: string) => void): Session {
   let index = session.strategyIndex
   while (index !== 0 && session.disabled[index]) index = (index + 1) % catalog.length
   onStrategy?.(catalog[index].name)

   // Run one strategy on an isolated board and pass-local memory.
   const board = new Board()
   board.data = copyGrid(session.grid)
   const memory = new StrategyMemory()
   memory[0].solved = session.solvedCount
   const results = index === 0 ? catalog.map(() => null) : [...session.results]
   const skippable = index === 0 ? catalog.map(() => false) : [...session.skippable]
   const result = catalog[index].run(board, memory[index])
   results[index] = result

   // Validate before publishing any mutations.
   const errored = result.successcount === SuccessError && !result.success
   const changed = !sameGrid(session.grid, board.data)
   const validity = checkValidity(board)
   // Reject a partially applied invalid strategy atomically; keep the input board.
   const invalid = errored || (changed && !validity.ok)
   if (invalid)
      results[index] = {
         success: false,
         successcount: SuccessError,
         message: result.message
      }
   const solved = !invalid && validity.ok && board.data.flat().every((cell) => cell.length === 1)

   // Choose whether to restart, continue the pass, or report exhaustion.
   let nextIndex: number
   let outcome: Session['outcome'] = result.success ? 'progress' : 'ready'
   if (invalid || solved) {
      nextIndex = 0
      outcome = invalid ? 'error' : 'solved'
   } else if (result.success && index !== 0) {
      nextIndex = 0
      skippable.fill(false)
   } else {
      // An unchanged solved count does not imply propagation has run: its switch
      // may have been disabled. A fresh pass always considers it normally.
      nextIndex = index + 1
      if (!result.success) skippable[index] = true
      while (nextIndex < catalog.length && (session.disabled[nextIndex] || skippable[nextIndex]))
         nextIndex++
      if (nextIndex >= catalog.length) {
         nextIndex = 0
         outcome = 'stalled'
      }
   }

   // Publish the snapshot and its user-facing explanation together.
   const diagnostic = board.diagnostics.join('\n')
   const message = invalid
      ? diagnostic ||
        result.message ||
        (!validity.ok ? validity.message : 'This strategy found an invalid board.')
      : solved
        ? 'Finished! :D'
        : outcome === 'stalled'
          ? 'No more progress with the enabled strategies.'
          : result.message ||
            diagnostic ||
            `${catalog[index].name}: ${result.success ? 'progress found.' : 'no change.'}`
   return {
      ...session,
      grid: invalid ? session.grid : board.data,
      previous: !invalid && result.success ? copyGrid(session.grid) : null,
      annotations: !invalid && result.success ? board.annotations : {},
      results,
      skippable,
      strategyIndex: nextIndex,
      lastStrategy: index,
      solvedCount: memory[0].solved,
      message,
      outcome
   }
}

/** Go means stop at the next successful strategy or after one complete pass. */
export function go(session: Session, onStrategy?: (strategy: string) => void): Session {
   let current = session
   for (let attempt = 0; attempt <= catalog.length; attempt++) {
      current = step(current, onStrategy)
      if (
         current.strategyIndex === 0 ||
         current.outcome === 'error' ||
         current.outcome === 'solved'
      )
         return current
   }
   return current
}
