import { SudokuDigits, IndexToNine, ROW_NAMES, COLUMN_NAMES, ALL_CANDIDATES, BOX_NAMES } from "../../Types"
import PureSudoku from "../PureSudoku"
import { boxAt, algebraic, boxNameAt } from "../Utils"

type validityResult = {
   ok: true
} | {
   ok: false,
   message: string
}

export default function checkValidity(sudoku: PureSudoku): validityResult {
   const solvedInColumns = [] as Array<Set<SudokuDigits>>
   const solvedInBoxes = [] as Array<Set<SudokuDigits>>
   const candidatesInColumns = [] as Array<Set<SudokuDigits>>
   const candidatesInBoxes = [] as Array<Set<SudokuDigits>>

   for (let i = 0; i < 9; i++) {
      solvedInColumns.push(new Set<SudokuDigits>())
      solvedInBoxes.push(new Set<SudokuDigits>())
      candidatesInColumns.push(new Set<SudokuDigits>())
      candidatesInBoxes.push(new Set<SudokuDigits>())
   }

   // Every time an index is changed, typing is there so that `typeof i !== number`
   // Expanding `i++` into `i = i+1` so that the type assertion works
   for (let i: IndexToNine = 0; i < 9; i = i + 1 as IndexToNine) {
      const solvedInRow = new Set<SudokuDigits>()
      const candidatesInRow = new Set<SudokuDigits>()

      for (let j: IndexToNine = 0; j < 9; j = j + 1 as IndexToNine) {
         const candidates = sudoku.data[i][j]
         const current = {
            column: j,
            box: boxAt(i, j)
         } as const

         // No possibilities
         if (candidates.length === 0) {
            return {
               ok: false,
               message: `Cell ${algebraic(i, j)} has 0 possible candidates!`
            }
         }

         if (candidates.length === 1) {
            const solvedCandidate = candidates[0]

            // Same in row
            if (solvedInRow.has(solvedCandidate)) {
               return {
                  ok: false,
                  message: `Two (or more) ${solvedCandidate}s in row ${ROW_NAMES[i]}!`
               }
            }

            // Same in column
            if (solvedInColumns[current.column].has(solvedCandidate)) {
               return {
                  ok: false,
                  message: `Two (or more) ${solvedCandidate}s in column ${COLUMN_NAMES[j]}!`
               }
            }

            // Same in box
            if (solvedInBoxes[current.box].has(solvedCandidate)) {
               return {
                  ok: false,
                  message: `Two (or more) ${solvedCandidate}s in box ${boxNameAt(i, j)}!`
               }
            }

            solvedInRow.add(solvedCandidate)
            solvedInColumns[current.column].add(solvedCandidate)
            solvedInBoxes[current.box].add(solvedCandidate)
         }

         for (const candidate of candidates) {
            candidatesInRow.add(candidate)
            candidatesInColumns[current.column].add(candidate)
            candidatesInBoxes[current.box].add(candidate)
         }
      }

      if (candidatesInRow.size !== 9) {
         const missingCandidates = ALL_CANDIDATES.filter(
            candidate => !candidatesInRow.has(candidate)
         )

         return {
            ok: false,
            message: `Row ${ROW_NAMES[i]} has 0 possibilities for ${missingCandidates.join('... and ')}!!!`
         }
      }
   }

   for (let i = 0; i < 9; i++) {
      if (candidatesInColumns[i].size !== 9) {
         const missingCandidates = ALL_CANDIDATES.filter(
            candidate => !candidatesInColumns[i].has(candidate)
         )

         return {
            ok: false,
            message: `Column ${COLUMN_NAMES[i]} has 0 possibilities for ${missingCandidates.join('... and ')}!!!`
         }
      }

      if (candidatesInBoxes[i].size !== 9) {
         const missingCandidates = ALL_CANDIDATES.filter(
            candidate => !candidatesInBoxes[i].has(candidate)
         )

         return {
            ok: false,
            message: `Box ${BOX_NAMES[i]} has 0 possibilities for ${missingCandidates.join('... and ')}!!!`
         }
      }
   }

   return {
      ok: true
   }
}