import { catalog } from './catalog'
import { createSession, copyGrid, exportGrid, importGrid, step, go } from './session'
import fixtures from './fixtures'

function puzzle(name: keyof typeof fixtures = 'Simple sudoku') {
   return createSession(importGrid(fixtures[name])!.grid)
}

test('all 18 legacy strategies are available in the same order', () => {
   expect(catalog).toHaveLength(18)
   expect(catalog[0].required).toBe(true)
   expect(catalog[17].name).toBe('XY Chain')
})

test('stepping is independent of a DOM and does not mutate its input', () => {
   const input = puzzle()
   const snapshot = structuredClone(input)
   const checked = step(input)
   expect(checked.lastStrategy).toBe(0)
   expect(checked.strategyIndex).toBe(1)
   const propagated = step(checked)
   expect(propagated.lastStrategy).toBe(1)
   expect(propagated.grid).not.toEqual(input.grid)
   expect(propagated.previous).toEqual(input.grid)
   expect(input).toEqual(snapshot)
})

test('Go stops on the next successful strategy, not at the final solution', () => {
   const input = puzzle()
   const next = go(input)
   expect(next.lastStrategy).toBe(1)
   expect(next.strategyIndex).toBe(0)
   expect(next.outcome).toBe('progress')
   expect(next.grid.flat().filter((cell) => cell.length === 1).length).toBeLessThan(81)
})

test('a complete pass on an empty board terminates', () => {
   const result = go(createSession())
   expect(result.outcome).toBe('stalled')
   expect(result.strategyIndex).toBe(0)
})

test('all optional strategies can be disabled without looping', () => {
   const input = createSession()
   input.disabled.fill(true, 1)
   expect(go(input).outcome).toBe('stalled')
})

test('disabled strategies are skipped', () => {
   const checked = step(puzzle())
   checked.disabled[1] = true
   expect(step(checked).lastStrategy).toBe(2)
})

test('re-enabling propagation makes the available eliminations reachable', () => {
   let session = createSession(importGrid('1' + '.'.repeat(80))!.grid)
   session.disabled[1] = true
   session = go(session)
   expect(session.outcome).toBe('stalled')
   session.disabled[1] = false
   const result = go(session)
   expect(result.results[1]).toMatchObject({ success: true, successcount: 20 })
   expect(result.outcome).toBe('progress')
})

test('invalid and solved boards return useful outcomes', () => {
   expect(go(puzzle('Invalid board')).outcome).toBe('error')
   const solved = go(puzzle('Solved board'))
   expect(solved.outcome).toBe('solved')
   expect(solved.message).toBe('Finished! :D')
})

test('candidate export is lossless, including cells with no candidates', () => {
   const input = puzzle().grid
   input[0][0] = []
   input[0][1] = [2, 6, 9]
   const output = exportGrid(input)
   expect(output.candidates).toHaveLength(729)
   expect(importGrid(output.candidates)?.grid).toEqual(input)
})

test('a malformed import cannot produce a board', () => {
   for (const text of ['', '   ', '123', 'not a puzzle']) expect(importGrid(text)).toBeNull()
})

test('advanced strategy explanations are data and do not mutate earlier snapshots', () => {
   let current = puzzle('Daily tough sudoku')
   let annotated = false
   for (let turns = 0; turns < 80; turns++) {
      const before = copyGrid(current.grid)
      const result = go(current)
      expect(current.grid).toEqual(before)
      annotated ||= Object.keys(result.annotations).length > 0
      current = result
      if (['solved', 'stalled', 'error'].includes(current.outcome)) break
   }
   expect(current.outcome).toBe('solved')
   expect(annotated).toBe(true)
})

test('an invalid partial strategy result is rolled back atomically', () => {
   const original = catalog[1].run
   const input = puzzle()
   input.strategyIndex = 1
   catalog[1].run = (board) => {
      board.data[0][0] = []
      return { success: false, successcount: -1, message: 'Contradiction' }
   }
   try {
      const result = step(input)
      expect(result.outcome).toBe('error')
      expect(result.grid).toEqual(input.grid)
      expect(result.message).toBe('Contradiction')
   } finally {
      catalog[1].run = original
   }
})

test('digit export contains nine rows without an extra terminal line', () => {
   const grid = puzzle('Solved board').grid
   const { digits } = exportGrid(grid)
   expect(digits.split('\n')).toHaveLength(9)
   expect(digits.endsWith('\n')).toBe(false)
   expect(importGrid(digits)?.grid).toEqual(grid)
})
