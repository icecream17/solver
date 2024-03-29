import React from 'react'

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

////////////
// Notice types

export const enum NoticeType {
   ALERT = "alert",
   PROMPT = "prompt",
}

export const enum AlertType {
   INFO = "info",
   WARN = "warning",
   ERROR = "error",
   SUCCESS = "success",
}

export type PromptCallback = (message: string | null) => void

export type NoticeInfo = {
   type: NoticeType.ALERT
   alertType: AlertType
   message: string
   cssCls?: string
} | {
   type: NoticeType.PROMPT
   title: string
   message: string
   defaultResponse: string
   cssCls?: string
   callback?: PromptCallback
}

// // whenConstruct
// TODO: Rename to WhenConstructCallback or something
export type GuaranteedConstructCallback = Readonly<{
   whenConstruct: _Callback
}>

////////////
// React types

export type _UnusedProps = typeof React.Component.prototype.props


////////////
// Utility types

export type TwoDimensionalArray<T> = Array<Array<T>>
export type ThreeDimensionalArray<T> = Array<Array<Array<T>>> // Row, Column, Candidates

// Credits to https://stackoverflow.com/a/50769802/12174015
export type Mutable<T> = {
   -readonly [P in keyof T]: T[P];
}

// See https://github.com/microsoft/TypeScript/issues/41225
export type _Callback = (...args: any[]) => void
export type _Function = (...args: any[]) => any

// Used to fix types in App.tsx
export type CouldAIsB<A, B> = A extends B
   ? boolean
   : (B extends A ? boolean : false)

// // See https://github.com/microsoft/TypeScript/issues/14094#issuecomment-373782604
// type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
// export type XOR<T, U> = (T | U) extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;
