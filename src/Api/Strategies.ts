import { COLUMN_NAMES, IndexToNine, MAX_CELL_INDEX, ROW_NAMES, SudokuDigits } from "../Types";
import PureSudoku from "./PureSudoku";
import { Strategy, StrategyError } from "./Types";
import { algebraic, boxAt, boxNameAt } from "./Utils";

type validityResult = {
   ok: true
} | {
   ok: false,
   message: string
}

export function checkValidity(sudoku: PureSudoku): validityResult {
   const solvedInColumns = [] as Array<Set<SudokuDigits>>
   const solvedInBoxes = [] as Array<Set<SudokuDigits>>

   for (let i = 0; i < 9; i++) {
      solvedInColumns.push(new Set<SudokuDigits>())
      solvedInBoxes.push(new Set<SudokuDigits>())
   }

   // Expanding `i++` into `i = i+1` so that the type assertion works
   for (let i: IndexToNine = 0; i < 9; i = i+1 as IndexToNine) {
      const solvedInRow = new Set<SudokuDigits>()

      for (let j: IndexToNine = 0; j < 9; j = j+1 as IndexToNine) {
         const candidates = sudoku.data[i][j]

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
            if (solvedInColumns[j].has(solvedCandidate)) {
               return {
                  ok: false,
                  message: `Two (or more) ${solvedCandidate}s in column ${COLUMN_NAMES[j]}!`
               }
            }

            // Same in box
            if (solvedInBoxes[boxAt(i, j)].has(solvedCandidate)) {
               return {
                  ok: false,
                  message: `Two (or more) ${solvedCandidate}s in box ${boxNameAt(i, j)}!`
               }
            }

            solvedInRow.add(solvedCandidate)
            solvedInColumns[j].add(solvedCandidate)
            solvedInBoxes[boxAt(i, j)].add(solvedCandidate)
         }
      }
   }
   return {
      ok: true
   }
}

// See comments on `Strategy`
export default [
   function checkForSolved (sudoku, solver) {
      const validity = checkValidity(sudoku)
      if (!validity.ok) {
         alert(validity.message)
         return {
            success: true,
            message: validity.message,
            successcount: -1
         } as StrategyError
      }

      // Should this be before checkValidity?
      if (typeof solver.solved !== "number") {
         throw TypeError(`solver.solved is not a number - got ${solver.solved}`)
      } else if (!Number.isInteger(solver.solved)) {
         throw TypeError(`solver.solved is not an integer - got ${solver.solved}`)
      } else if (0 > solver.solved || solver.solved > MAX_CELL_INDEX) {
         throw TypeError(`impossible amount of solver.solved - got ${solver.solved}`)
      }

      if (solver.solved === MAX_CELL_INDEX) {
         alert("Finished! :D")
         return {
            success: true,
            successcount: MAX_CELL_INDEX
         }
      }

      let totalSolved = 0
      for (const row of sudoku.data) {
         for (const cellCandidates of row) {
            if (cellCandidates.length === 1) {
               totalSolved++
            }
         }
      }

      if (totalSolved > solver.solved) {
         const difference = totalSolved - solver.solved
         solver.solved = totalSolved
         return {
            success: true,
            successcount: difference
         }
      }

      return {
         success: false
      }
   },

   function updateCandidates (sudoku, _solver) {
      let updated = 0
      let solved = {
         rows: [] as Array<Set<sudokuDigits>>,
         columns: [] as Array<Set<sudokuDigits>>,
         boxes: [] as Array<Set<sudokuDigits>>
      }

      for (let i = 0; i < 9; i++) {
         solved.rows.push(new Set<sudokuDigits>())
         solved.columns.push(new Set<sudokuDigits>())
         solved.boxes.push(new Set<sudokuDigits>())
      }

      for (let i = 0; i < 9; i = i+1 as IndexToNine) {
         for (let j = 0; j < 9; j = j+1 as IndexToNine) {
            if (sudoku.data[i][j].length === 1) {
               const solvedCandidate = sudoku.data[i][j][0]
               solved.rows[i].add(solvedCandidate)
               solved.columns[i].add(solvedCandidate)
               solved.boxes[boxAt(i, j)].add(solvedCandidate)
            }
         }
      }

      for (let i = 0; i < 9; i = i+1 as IndexToNine) {
         for (let j = 0; j < 9; j = j+1 as IndexToNine) {
            const datacell = sudoku.data[i][j]
            for (let k = 0; k < datacell.length; k = k+1 as IndexToNine) {
               const candidate = sudoku[k]
               if (solved.rows[i].has(candidate) ||
                   solved.columns[j].has(candidate) ||
                   solved.boxes[boxAt(i, j)].has(candidate))
               {
                  updated++
                  datacell.splice(k, 1) // Deletes the candidate

                  // Now that the candidate is deleted,
                  // the index already corresponds to the next candidate.
                  // Since the for-loop automatically increments k, we decrement k
                  //
                  // But if the candidate index is the last index,
                  // the for loop still keeps going since the condition is
                  // checked before the increment, and k-1 < k (=== datacell.length)
                  //
                  // That's why there's an if statement checking if k === datacell.length
                  if (k === datacell.length) {
                     break;
                  }
                  k = k-1 as IndexToNine
               }
            }
         }
      }

      if (updated > 0) {
         return {
            success: true,
            successcount: updated
         }
      } else {
         return {
            success: false
         }
      }
   }
] as Strategy[]
