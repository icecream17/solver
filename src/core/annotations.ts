import type Board from './board'
import type { SudokuDigits, IndexToNine } from './types'
import { INDICES_TO_NINE } from './types'
import { id, type CellID, type CandidateID } from './geometry'

// Strategies emit presentation data; they never access a component or the DOM.
export function highlightCell(board: Board, cell: CellID, color = 'blue') {
   board.mark(cell.row, cell.column, color)
}

export function highlightGroup(board: Board, group: Iterable<CellID>, color = 'blue') {
   for (const cell of group) highlightCell(board, cell, color)
}

/** Mark one digit across cells. Colors accumulate; Annotations.css resolves combinations. */
export function colorGroup(
   board: Board,
   group: Iterable<CellID>,
   digit: SudokuDigits,
   color = 'blue'
) {
   for (const cell of group) board.mark(cell.row, cell.column, color, digit)
}

export function colorCandidateF(
   board: Board,
   row: IndexToNine,
   column: IndexToNine,
   digit: SudokuDigits,
   color = 'blue'
) {
   board.mark(row, column, color, digit)
}

export function colorCandidate(board: Board, candidate: CandidateID, color = 'blue') {
   colorCandidateF(board, candidate.row, candidate.column, candidate.digit, color)
}

export function numberOfCellsWithNCandidates(board: Board, count: number) {
   return board.data.flat().filter((cell) => cell.length === count).length
}

export function getCellsWithNCandidates(board: Board, count: number) {
   return INDICES_TO_NINE.flatMap((row) =>
      INDICES_TO_NINE.filter((column) => board.data[row][column].length === count).map((column) =>
         id(row, column)
      )
   )
}

/** Return whether any cell changed, not the number of eliminations. */
export function removeCandidateFromCells(
   board: Board,
   digit: SudokuDigits,
   cells: Iterable<CellID>
) {
   let changed = false
   for (const cell of cells) {
      if (board.data[cell.row][cell.column].includes(digit)) {
         board.remove(digit).at(cell.row, cell.column)
         changed = true
      }
   }
   return changed
}

export function wouldRemoveCandidateFromCells(
   board: Board,
   digit: SudokuDigits,
   cells: Iterable<CellID>
) {
   return Array.from(cells).some((cell) => board.data[cell.row][cell.column].includes(digit))
}
