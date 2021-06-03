import { ALL_CANDIDATES, BOX_NAMES, COLUMN_NAMES, IndexToNine, MAX_CELL_INDEX, ROW_NAMES, SudokuDigits, TwoDimensionalArray } from "../Types";
import PureSudoku from "./PureSudoku";
import Solver from "./Solver";
import Sudoku from "./Sudoku";
import { Strategy } from "./Types";
import { algebraic, boxAt, boxNameAt, affects } from "./Utils";

type validityResult = {
   ok: true
} | {
   ok: false,
   message: string
}

export function checkValidity(sudoku: PureSudoku): validityResult {
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

      for (let j: IndexToNine = 0; j < 9; j = j+1 as IndexToNine) {
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

// See comments on `Strategy`
const STRATEGIES = [
   function checkForSolved (sudoku: Sudoku, solver: Solver) {
      const validity = checkValidity(sudoku)
      if (!validity.ok) {
         window._custom.alert(validity.message)
         return {
            success: true,
            message: validity.message,
            successcount: -1
         } as const
      }

      // Should this be before checkValidity?
      if (typeof solver.solved !== "number") {
         throw TypeError(`solver.solved is not a number - got ${String(solver.solved)}`)
      } else if (!Number.isInteger(solver.solved)) {
         throw TypeError(`solver.solved is not an integer - got ${solver.solved}`)
      } else if (0 > solver.solved || solver.solved > MAX_CELL_INDEX) {
         throw TypeError(`impossible amount of solver.solved - got ${solver.solved}`)
      }

      if (solver.solved === MAX_CELL_INDEX) {
         window._custom.alert("Finished! :D")
         return {
            success: true,
            successcount: MAX_CELL_INDEX + 1
         } as const
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
         } as const
      }

      return {
         success: false
      } as const
   },

   // O(n^5)
   function updateCandidates (sudoku: PureSudoku, _solver: Solver) {
      let updated = 0

      for (let i: IndexToNine = 0; i < 9; i = i+1 as IndexToNine) {
         for (let j: IndexToNine = 0; j < 9; j = j+1 as IndexToNine) {
            // Cell
            if (sudoku.data[i][j].length === 1) {

               // Cell > Candidate
               const solvedCandidate = sudoku.data[i][j][0]

               // Cell > Affects
               for (const [row, column] of affects(i, j)) {

                  // Cell > Affects > Cell
                  const datacell = sudoku.data[row][column]
                  for (let k: IndexToNine = 0; k < datacell.length; k = k+1 as IndexToNine) {

                     // Cell > Affects > Cell > Candidate
                     if (datacell[k] === solvedCandidate) {
                        if (datacell.length === 1) {
                           return {
                              success: true,
                              successcount: -1,
                              message: `Both ${algebraic(i, j)} and ${algebraic(row, column)} must be ${solvedCandidate}`
                           }
                        }

                        updated++
                        datacell.splice(k, 1) // Deletes the candidate
                        sudoku.set(row, column).to(...datacell) // Updates/renders the cell too

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
         }
      }

      if (updated > 0) {
         return {
            success: true,
            successcount: updated
         } as const
      } else {
         return {
            success: false
         } as const
      }
   },

   function hiddenSingles(sudoku: PureSudoku, _solver: Solver): validityResult {
      type PossibleState = boolean | [IndexToNine, IndexToNine]
      function nextState (currentState: PossibleState, row: IndexToNine, column: IndexToNine) {
         if (currentState === true) {
            return [row, column]
         }

         return false
      }

      // true = 0 found
      // (location) = 1 found
      // false = 2 found
      const possible = {
         rows: [] as TwoDimensionalArray<PossibleState>,
         columns: [] as TwoDimensionalArray<PossibleState>,
         boxes: [] as TwoDimensionalArray<PossibleState>,
      }

      // 9 rows, 9 candidates
      for (let i = 0; i < 9; i++) {
         possible.rows.push([true, true, true, true, true, true, true, true, true])
         possible.columns.push([true, true, true, true, true, true, true, true, true])
         possible.boxes.push([true, true, true, true, true, true, true, true, true])
      }

      for (let row: IndexToNine = 0; row < 9; row = row + 1 as IndexToNine) {
         for (let column: IndexToNine = 0; column < 9; column = column + 1 as IndexToNine) {
            for (const candidate of sudoku.data[row][column]) {
               possible.rows[row][candidate] = nextState(possible.rows[row][candidate], row, column)
               possible.columns[column][candidate] = nextState(possible.columns[column][candidate], row, column)
               possible.boxes[boxAt(row, column)][candidate] = nextState(possible.boxes[boxAt(row, column)][candidate], row, column)
            }
         }
      }

      let successcount = 0
      for (let candidate: IndexToNine = 0; candidate < 9; candidate = candidate + 1 as IndexToNine) {
         for (let i = 0; i < 9; i++) {
            if (typeof possible.rows[i][candidate] !== "boolean") {
               successcount++
               sudoku.set(...possible.rows[i][candidate]).to(candidate + 1 as SudokuDigits)
            }
            if (typeof possible.columns[i][candidate] !== "boolean") {
               successcount++
               sudoku.set(...possible.columns[i][candidate]).to(candidate + 1 as SudokuDigits)
            }
            if (typeof possible.boxes[i][candidate] !== "boolean") {
               successcount++
               sudoku.set(...possible.boxes[i][candidate]).to(candidate + 1 as SudokuDigits)
            }
         }
      }

      if (successcount !== 0) {
         return {
            success: true,
            successcount
         } as const
      }

      return {
         success: false
      } as const
   }
] as const

export default STRATEGIES as typeof STRATEGIES & Strategy[]
