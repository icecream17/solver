import boards from '../src/core/benchmark-boards'
import { createSession, importGrid, go, sameGrid } from '../src/core/session'
import { catalog } from '../src/core/catalog'

// This reference search shares no geometry, validity or strategy helpers with the solver.
// Preserving one solution is a useful falsification check, not a proof of every deduction.
class SearchBudgetExceeded extends Error {}

function referenceSolution(text: string, budget: number) {
   const values = [...text].map((character) => Number(character) || 0)
   const rows = Array<number>(9).fill(0)
   const columns = Array<number>(9).fill(0)
   const boxes = Array<number>(9).fill(0)
   const boxOf = (index: number) => Math.floor(index / 27) * 3 + Math.floor((index % 9) / 3)
   let nodes = 0

   for (const [index, digit] of values.entries()) {
      if (!digit) continue
      const row = Math.floor(index / 9),
         column = index % 9,
         box = boxOf(index)
      const bit = 1 << digit
      if ((rows[row] | columns[column] | boxes[box]) & bit) return null
      rows[row] |= bit
      columns[column] |= bit
      boxes[box] |= bit
   }

   function search(): boolean {
      if (++nodes > budget) throw new SearchBudgetExceeded()
      let best = -1,
         choices = 0,
         size = 10
      for (let index = 0; index < 81; index++) {
         if (values[index]) continue
         const bits =
            0x3fe & ~(rows[Math.floor(index / 9)] | columns[index % 9] | boxes[boxOf(index)])
         let count = 0
         for (let remaining = bits; remaining; remaining &= remaining - 1) count++
         if (!count) return false
         if (count < size) {
            best = index
            choices = bits
            size = count
         }
         if (count === 1) break
      }
      if (best === -1) return true
      const row = Math.floor(best / 9),
         column = best % 9,
         box = boxOf(best)
      for (let remaining = choices; remaining; remaining &= remaining - 1) {
         const bit = remaining & -remaining
         values[best] = Math.log2(bit)
         rows[row] |= bit
         columns[column] |= bit
         boxes[box] |= bit
         if (search()) return true
         values[best] = 0
         rows[row] ^= bit
         columns[column] ^= bit
         boxes[box] ^= bit
      }
      return false
   }
   return search() ? values : null
}

const budget = Number(process.argv[2] ?? 200000)
if (!Number.isSafeInteger(budget) || budget < 1)
   throw new Error('Pass a positive search-node budget.')
const summary = {
   puzzles: boards.length,
   searchNodeBudget: budget,
   referenceSolutions: 0,
   unverifiedPuzzles: [] as number[],
   noSolution: 0,
   commandsChecked: 0,
   solved: 0,
   stalled: 0,
   solverErrors: 0,
   turnLimit: 0,
   violations: [] as {
      puzzle: number
      turn: number
      cell: number
      digit: number
      strategy: string
   }[],
   changedCommands: Object.fromEntries(catalog.map(({ name }) => [name, 0]))
}

for (const [index, representation] of boards.entries()) {
   const text = representation.replaceAll(/\s/g, '')
   if (!/^[.0-9]{81}$/.test(text))
      throw new Error(`Unexpected corpus format at puzzle ${index + 1}.`)
   const imported = importGrid(representation)
   if (!imported) throw new Error(`Could not import corpus puzzle ${index + 1}.`)
   let session = createSession(imported.grid)

   // Check the production parser against raw givens, without using it in the reference search.
   const cells = session.grid.flat()
   for (let cell = 0; cell < 81; cell++) {
      const digit = Number(text[cell]) || 0
      const matches = digit
         ? cells[cell].length === 1 && cells[cell][0] === digit
         : cells[cell].length === 9 &&
           cells[cell].every((value, position) => value === position + 1)
      if (!matches) throw new Error(`Parser mismatch at puzzle ${index + 1}, cell ${cell + 1}.`)
   }

   let known: number[] | null
   try {
      known = referenceSolution(text, budget)
   } catch (error) {
      if (!(error instanceof SearchBudgetExceeded)) throw error
      summary.unverifiedPuzzles.push(index + 1)
      continue
   }
   if (!known) {
      summary.noSolution++
      continue
   }
   if (
      !known.every(
         (digit, cell) =>
            Number.isInteger(digit) &&
            digit >= 1 &&
            digit <= 9 &&
            (!(Number(text[cell]) || 0) || digit === Number(text[cell]))
      )
   )
      throw new Error(`Invalid reference values at puzzle ${index + 1}.`)
   for (let unit = 0; unit < 9; unit++) {
      const row = known.slice(unit * 9, unit * 9 + 9)
      const column = Array.from({ length: 9 }, (_, r) => known![r * 9 + unit])
      const box = Array.from(
         { length: 9 },
         (_, cell) =>
            known![
               (Math.floor(unit / 3) * 3 + Math.floor(cell / 3)) * 9 + (unit % 3) * 3 + (cell % 3)
            ]
      )
      if ([row, column, box].some((digits) => new Set(digits).size !== 9))
         throw new Error(`Invalid reference unit at puzzle ${index + 1}.`)
   }
   summary.referenceSolutions++
   for (let turn = 0; turn < 729; turn++) {
      const before = session
      session = go(session)
      summary.commandsChecked++
      const strategy = catalog[session.lastStrategy!].name
      if (!sameGrid(before.grid, session.grid)) summary.changedCommands[strategy]++
      const current = session.grid.flat()
      const missing = known.findIndex(
         (digit, cell) => !current[cell].some((candidate) => candidate === digit)
      )
      if (missing !== -1) {
         summary.violations.push({
            puzzle: index + 1,
            turn: turn + 1,
            cell: missing + 1,
            digit: known[missing],
            strategy
         })
         break
      }
      if (session.outcome === 'solved') {
         summary.solved++
         break
      }
      if (session.outcome === 'stalled') {
         summary.stalled++
         break
      }
      if (session.outcome === 'error') {
         summary.solverErrors++
         break
      }
      if (turn === 728) summary.turnLimit++
   }
}
console.log(JSON.stringify(summary, null, 2))
if (summary.violations.length || summary.solverErrors || summary.noSolution || summary.turnLimit)
   process.exitCode = 1
