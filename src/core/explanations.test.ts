import { cellExplanation, stepExplanations } from './explanations'
import { EMPTY_CELL_MARKS } from './marks'
import { createSession, importGrid } from './session'
import { DENSE_BIVALUE_BOARD } from './stress-boards'
import checkValidity from './strategies/checkValidity'
import Board from './board'

test('changes and reason colors have a text explanation', () => {
   expect(cellExplanation([1, 4], [1, 2, 3], {
      cells: ['blue'], candidates: { 1: ['green', 'orange'], 4: ['solved'] }
   })).toBe('Eliminated: 2, 3. Added: 4. Cell: reason. Candidate 1: alternate, pivot. Candidate 4: solved.')
   expect(cellExplanation([1], undefined, EMPTY_CELL_MARKS)).toBe('')
})

test('a whole-step explanation identifies the affected cells', () => {
   const { grid } = createSession()
   const previous = structuredClone(grid)
   grid[0][0] = [1]
   expect(stepExplanations(grid, previous, {})).toEqual(['A1: Eliminated: 2, 3, 4, 5, 6, 7, 8, 9.'])
})

test('the documented timeout board is valid and has two candidates per cell', () => {
   const imported = importGrid(DENSE_BIVALUE_BOARD)!
   const board = new Board()
   board.data = imported.grid
   expect(checkValidity(board).ok).toBe(true)
   expect(board.data.flat().every(cell => cell.length === 2)).toBe(true)
})
