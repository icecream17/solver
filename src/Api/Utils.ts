import { AlgebraicName, COLUMN_NAMES, IndexTo81, IndexToNine, ROW_NAMES, SudokuDigits } from "../Types";

export function algebraic (row: IndexToNine, column: IndexToNine): AlgebraicName {
   return ROW_NAMES[row] + COLUMN_NAMES[column] as AlgebraicName
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

const _affectsCache = new Map<IndexTo81, Readonly<Array<Readonly<[IndexToNine, IndexToNine]>>>>()

/**
 * All cells a square affects, or
 * All cells that affect a square
 */
export function affects (row: IndexToNine, column: IndexToNine): Readonly<Array<Readonly<[IndexToNine, IndexToNine]>>>  {
   const thisIndex = indexOf(row, column)
   const results = [] as IndexTo81[] // I could optimize, but it's here for simplicity

   if (_affectsCache.has(thisIndex)) {
      // Seems like another typescript bug
      return _affectsCache.get(thisIndex) as Readonly<Array<Readonly<[IndexToNine, IndexToNine]>>>
   }

   // For each row / column
   for (let i: IndexToNine = 0; i < 9; i = i+1 as IndexToNine) {
      // Different column => affects [same row, different column]
      if (i !== column) {
         results.push(indexOf(row, i))
      }

      // Different row => affects [different row, same column]
      if (i !== row) {
         results.push(indexOf(i, column))
      }
   }

   // this box
   for (const boxCellIndex of boxesCells[boxAt(row, column)]) {
      // different cell
      if (boxCellIndex !== thisIndex) {
         // prevents duplicates
         // (there's no check for the row and column since they don't collide)
         if (!results.includes(boxCellIndex)) {
            results.push(boxCellIndex)
         }
      }
   }

   const result = results.map(index => indexToRowAndColumn[index]) // Formatting
   _affectsCache.set(thisIndex, result) // Cache
   return result
}
