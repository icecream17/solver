import { ROW_NAMES } from './types'
import type { SudokuDigits } from './types'
import type { CellMarks, Annotations } from './marks'
import { EMPTY_CELL_MARKS } from './marks'
import type { Grid } from './session'

const meanings: Record<string, string> = {
   blue: 'reason',
   green: 'alternate',
   orange: 'pivot',
   salmon: 'secondary pivot',
   solved: 'solved'
}

function describeMarks(colors: readonly string[]) {
   return colors.map(color => meanings[color] ?? color).join(', ')
}

/** The same explanation is available as visible text and as a cell description. */
export function cellExplanation(current: SudokuDigits[], previous: SudokuDigits[] | undefined, marks: CellMarks) {
   const parts: string[] = []
   if (previous) {
      const removed = previous.filter(digit => !current.includes(digit))
      const added = current.filter(digit => !previous.includes(digit))
      if (removed.length) parts.push(`Eliminated: ${removed.join(', ')}.`)
      if (added.length) parts.push(`Added: ${added.join(', ')}.`)
   }
   if (marks.cells.length) parts.push(`Cell: ${describeMarks(marks.cells)}.`)
   for (const [digit, colors] of Object.entries(marks.candidates)) {
      parts.push(`Candidate ${digit}: ${describeMarks(colors)}.`)
   }
   return parts.join(' ')
}

export function stepExplanations(grid: Grid, previous: Grid | null, annotations: Annotations) {
   return grid.flatMap((row, r) => row.flatMap((cell, c) => {
      const explanation = cellExplanation(cell, previous?.[r][c], annotations[r * 9 + c] ?? EMPTY_CELL_MARKS)
      return explanation ? [`${ROW_NAMES[r]}${c + 1}: ${explanation}`] : []
   }))
}
