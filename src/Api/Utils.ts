import { COLUMN_NAMES, IndexTo81, IndexToNine, ROW_NAMES, SudokuDigits } from "../Types";

export function algebraic (row: IndexToNine, column: IndexToNine) {
   return (
      ROW_NAMES[row] +
      COLUMN_NAMES[column]
   ) as (
      "A1" | "A2" | "A3" | "A4" | "A5" | "A6" | "A7" | "A8" | "A9" |
      "B1" | "B2" | "B3" | "B4" | "B5" | "B6" | "B7" | "B8" | "B9" |
      "C1" | "C2" | "C3" | "C4" | "C5" | "C6" | "C7" | "C8" | "C9" |
      "D1" | "D2" | "D3" | "D4" | "D5" | "D6" | "D7" | "D8" | "D9" |
      "E1" | "E2" | "E3" | "E4" | "E5" | "E6" | "E7" | "E8" | "E9" |
      "F1" | "F2" | "F3" | "F4" | "F5" | "F6" | "F7" | "F8" | "F9" |
      "G1" | "G2" | "G3" | "G4" | "G5" | "G6" | "G7" | "G8" | "G9" |
      "H1" | "H2" | "H3" | "H4" | "H5" | "H6" | "H7" | "H8" | "H9" |
      "J1" | "J2" | "J3" | "J4" | "J5" | "J6" | "J7" | "J8" | "J9"
   )
}

/** What index a cell is at */
export function indexOf (row: IndexToNine, column: IndexToNine): IndexTo81 {
   return (row * 9 + column) as IndexTo81
}

export const indexToRowAndColumn = [
   [0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [0, 8],
   [1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7], [1, 8],
   [2, 0], [2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [2, 7], [2, 8],
   [3, 0], [3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [3, 6], [3, 7], [3, 8],
   [4, 0], [4, 1], [4, 2], [4, 3], [4, 4], [4, 5], [4, 6], [4, 7], [4, 8],
   [5, 0], [5, 1], [5, 2], [5, 3], [5, 4], [5, 5], [5, 6], [5, 7], [5, 8],
   [6, 0], [6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [6, 6], [6, 7], [6, 8],
   [7, 0], [7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6], [7, 7], [7, 8],
   [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 6], [8, 7], [8, 8],
] as const

// Imaginary apostrophe
export const boxesCells = [
   [0, 1, 2, 9, 10, 11, 18, 19, 20], [3, 4, 5, 12, 13, 14, 21, 22, 23], [6, 7, 8, 15, 16, 17, 24, 25, 26],
   [27, 28, 29, 36, 37, 38, 45, 46, 47], [30, 31, 32, 39, 40, 41, 48, 49, 50], [33, 34, 35, 42, 43, 44, 51, 52, 53],
   [54, 55, 56, 63, 64, 65, 72, 73, 74], [57, 58, 59, 66, 67, 68, 75, 76, 77], [60, 61, 62, 69, 70, 71, 78, 79, 80],
] as const

export const boxRow = [0, 0, 0, 3, 3, 3, 6, 6, 6] as const
export const boxColumn = [0, 0, 0, 1, 1, 1, 2, 2, 2] as const
export function boxAt (row: IndexToNine, column: IndexToNine): IndexToNine {
   // + │ 0 1 2
   // ──┼──────
   // 0 │ 0 1 2
   // 3 │ 3 4 5
   // 6 │ 6 7 8
   return boxRow[row] + boxColumn[column] as IndexToNine
}

export function boxNameAt(row: IndexToNine, column: IndexToNine): SudokuDigits {
   return boxAt(row, column) + 1 as SudokuDigits
}

export function affectsRow (row: IndexToNine, column: IndexToNine): [IndexToNine, IndexToNine][] {
   const results = [] as [IndexToNine, IndexToNine][]
   for (let i: IndexToNine = 0; i < 9; i = i+1 as IndexToNine) {
      if (i !== column) {
         results.push([row, i])
      }
   }
   return results
}

export function affectsColumn (row: IndexToNine, column: IndexToNine): [IndexToNine, IndexToNine][] {
   const results = [] as [IndexToNine, IndexToNine][]
   for (let i: IndexToNine = 0; i < 9; i = i+1 as IndexToNine) {
      if (i !== row) {
         results.push([i, column])
      }
   }
   return results
}

export function affectsBox (row: IndexToNine, column: IndexToNine): [IndexToNine, IndexToNine][] {
   const results = [] as [IndexToNine, IndexToNine][]
   for (const cell of boxesCells[boxAt(row, column)]) {
      // If https://github.com/microsoft/TypeScript/issues/36554#issuecomment-845292965 is fixed
      // then use `slice` which doesn't iterate
      results.push([...indexToRowAndColumn[cell]])
   }
   return results
}


/**
 * All cells a square affects, or
 * All cells that affect a square
 */
export function affects (row: IndexToNine, column: IndexToNine): [IndexToNine, IndexToNine][] {
   // To remove duplicates
   const alreadyTaken = new Set<IndexTo81>()
   const results = [] as [IndexToNine, IndexToNine][]
   for (const [row2, column2] of affectsRow(row, column).concat(affectsColumn(row, column), affectsBox(row, column))) {
      alreadyTaken.add(indexOf(row2, column2))
   }
   return Array.from(alreadyTaken).map(index => indexToRowAndColumn[index])
}
