// @flow

import { AlgebraicName, BoxName, BOX_NAMES, COLUMN_NAMES, IndexTo81, IndexToNine, INDICES_TO_NINE, ROW_NAMES, SudokuDigits, ThreeDimensionalArray, TwoDimensionalArray } from "../Types";

export function algebraic (row: IndexToNine, column: IndexToNine): AlgebraicName {
   return `${ROW_NAMES[row]}${COLUMN_NAMES[column]}` as const
}

export class CellID {
   constructor (public row: IndexToNine, public column: IndexToNine) {}

   *[Symbol.iterator]() {
      yield this.row
      yield this.column
   }
}

export class CandidateID {
   constructor(
      public row: IndexToNine,
      public column: IndexToNine,
      public digit: SudokuDigits,
   ) {}

   *[Symbol.iterator] () {
      yield this.row
      yield this.column
      yield this.digit
   }
}

const cellIDs = [] as TwoDimensionalArray<CellID>
const candidateIDs = [] as ThreeDimensionalArray<CandidateID>
export function id (row: IndexToNine, column: IndexToNine): CellID;
export function id (row: IndexToNine, column: IndexToNine, digit: SudokuDigits): CandidateID;
export function id (row: IndexToNine, column: IndexToNine, digit?: SudokuDigits) {
   if (digit === undefined) {
      cellIDs[row] ??= []
      cellIDs[row][column] ??= new CellID(row, column)
      return cellIDs[row][column]
   } else {
      candidateIDs[row] ??= []
      candidateIDs[row][column] ??= []
      candidateIDs[row][column][digit] ??= new CandidateID(row, column, digit)
      return candidateIDs[row][column][digit]
   }
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

export function boxNameAt(row: IndexToNine, column: IndexToNine): BoxName {
   return BOX_NAMES[boxAt(row, column)]
}

const _affectsCache = new Map<IndexTo81, CellID[]>()

/**
 * All cells a square affects, or
 * All cells that affect a square
 *
 * A cell does not affect itself
 */
export function affects (row: IndexToNine, column: IndexToNine) {
   const thisIndex = indexOf(row, column)
   const results = [] as IndexTo81[] // I could optimize, but it's here for simplicity

   if (_affectsCache.has(thisIndex)) {
      // Seems like another typescript bug
      return _affectsCache.get(thisIndex) as CellID[]
   }

   // For each row / column
   for (const i of INDICES_TO_NINE) {
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
      if (boxCellIndex !== thisIndex) { // eslint-disable-line sonarjs/no-collapsible-if --- Documentation so can't collapse
         // prevents duplicates
         // (there's no check for the row and column since they don't collide)
         if (!results.includes(boxCellIndex)) {
            results.push(boxCellIndex)
         }
      }
   }

   const result = results.map(index => id(...(indexToRowAndColumn[index] as [IndexToNine, IndexToNine]))) // Formatting
   _affectsCache.set(thisIndex, result) // Cache
   return result
}


/**
 * Turns something with length 81
 * to an array of 9 things, each with length 9
 */
export function to9by9<T>(thing: T[]): [T[], T[], T[], T[], T[], T[], T[], T[], T[]]
export function to9by9(thing: string): [string, string, string, string, string, string, string, string, string]
export function to9by9<T>(thing: T[] | string) {
   return [
      thing.slice(0, 9),
      thing.slice(9, 18),
      thing.slice(18, 27),
      thing.slice(27, 36),
      thing.slice(36, 45),
      thing.slice(45, 54),
      thing.slice(54, 63),
      thing.slice(63, 72),
      thing.slice(72),
   ] as const
}

export const indexTo3x3 = [
   [0, 0], [0, 1], [0, 2],
   [1, 0], [1, 1], [1, 2],
   [2, 0], [2, 1], [2, 2],
] as const

/**
 * Takes a box and the index of a cell in that box
 *
 * Then returns the position (CellID) of the cell (in the whole sudoku)
 */
export function getIDFromIndexWithinBox(indexOfBox: IndexToNine, indexInBox: IndexToNine) {
   const [boxRow, boxColumn] = indexTo3x3[indexOfBox]
   const [withinRow, withinColumn] = indexTo3x3[indexInBox]
   return id(boxRow * 3 + withinRow as IndexToNine, boxColumn * 3 + withinColumn as IndexToNine)
}

/**
 * Removes an {@param element} from an {@param array}
 */
export function removeFromArray<T> (element: T, array: T[]) {
   const index = array.indexOf(element)
   if (index !== -1) {
      array.splice(index, 1)
   }
}

/**
 * Intersection of multiple arrays
 *
 * [2, 3] & [3, 4] --> 3
 * [2, 3, 4] & [3, 4] --> 3, 4
 *
 * @example
 * notInLine.sort((a, b) => a.length - b.length) // Smallest length
 * const shared = sharedInArrays(...notInLine)
 */
export function sharedInArrays<T>(...arrays: T[][]) {
   arrays = arrays.sort((a, b) => a.length - b.length) // Optimization
   const shared = new Set<T>(arrays[0])
   for (const element of shared) {
      for (const array of arrays) {
         if (!array.includes(element)) {
            shared.delete(element)
         }
      }
   }

   return shared
}

/**
 * Very similar to {@link sharedInArrays}
 */
export function sharedInSets<T> (...sets: Set<T>[]) {
   sets = sets.sort((a, b) => a.size - b.size) // Optimization
   const shared = new Set<T>(sets[0])
   for (const element of shared) {
      for (const set of sets) {
         if (!set.has(element)) {
            shared.delete(element)
         }
      }
   }

   return shared
}

export function assertGet<K, V> (map: Map<K, V>, key: K) {
   const value = map.get(key)
   if (value === undefined) {
      throw new ReferenceError("Map doesn't have this value / This error will never happen")
   }

   return value
}
