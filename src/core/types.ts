

////////////
// Sudoku types

export type SudokuDigits = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
export type IndexToNine = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
export type ZeroToNine = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 /// For measuring the amount of candidates in a cell
export type IndexTo81 = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50 | 51 | 52 | 53 | 54 | 55 | 56 | 57 | 58 | 59 | 60 | 61 | 62 | 63 | 64 | 65 | 66 | 67 | 68 | 69 | 70 | 71 | 72 | 73 | 74 | 75 | 76 | 77 | 78 | 79 | 80
export type RowName = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "J"
export type ColumnName = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
export type BoxName = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
export type AlgebraicName = `${RowName}${ColumnName}`

// Used to humanize indices
export const ROW_NAMES = ["A", "B", "C", "D", "E", "F", "G", "H", "J"] as const
export const COLUMN_NAMES = ["1", "2", "3", "4", "5", "6", "7", "8", "9"] as const
export const BOX_NAMES = ["1", "2", "3", "4", "5", "6", "7", "8", "9"] as const

// Used in for loops
export const MAX_CELL_INDEX = 80
export const NUMBER_OF_CELLS = 81
export const INDICES_TO_NINE = [0, 1, 2, 3, 4, 5, 6, 7, 8] as const
export const ALL_CANDIDATES = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const

export type GrpTyp = "row" | "column" | "box"
export const GRP_TYPS = ["row", "column", "box"] as const
export const GRP_NAMES = {
   row: ROW_NAMES,
   column: COLUMN_NAMES,
   box: BOX_NAMES,
} as const


export type TwoDimensionalArray<T> = T[][]
export type ThreeDimensionalArray<T> = T[][][]
