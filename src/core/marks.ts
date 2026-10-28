import type { SudokuDigits } from './types'

// Sparse on the solver side: only cells used in a successful explanation are stored.
export type CellMarks = {
   cells: readonly string[]
   candidates: Partial<Record<SudokuDigits, readonly string[]>>
}

export type Annotations = Partial<Record<number, CellMarks>>

// Components always receive marks, even when the sparse record has no entry.
export const EMPTY_CELL_MARKS: CellMarks = Object.freeze({
   cells: Object.freeze([]),
   candidates: Object.freeze({})
})
