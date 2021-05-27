// @flow

import React from 'react';

////////////
// Sudoku types

export type SudokuDigits = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
export type IndexToNine = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
export type ZeroToNine = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 /// For measuring the amount of candidates in a cell
export type IndexTo81 = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50 | 51 | 52 | 53 | 54 | 55 | 56 | 57 | 58 | 59 | 60 | 61 | 62 | 63 | 64 | 65 | 66 | 67 | 68 | 69 | 70 | 71 | 72 | 73 | 74 | 75 | 76 | 77 | 78 | 79 | 80
export type AlgebraicName =
   "A1" | "A2" | "A3" | "A4" | "A5" | "A6" | "A7" | "A8" | "A9" |
   "B1" | "B2" | "B3" | "B4" | "B5" | "B6" | "B7" | "B8" | "B9" |
   "C1" | "C2" | "C3" | "C4" | "C5" | "C6" | "C7" | "C8" | "C9" |
   "D1" | "D2" | "D3" | "D4" | "D5" | "D6" | "D7" | "D8" | "D9" |
   "E1" | "E2" | "E3" | "E4" | "E5" | "E6" | "E7" | "E8" | "E9" |
   "F1" | "F2" | "F3" | "F4" | "F5" | "F6" | "F7" | "F8" | "F9" |
   "G1" | "G2" | "G3" | "G4" | "G5" | "G6" | "G7" | "G8" | "G9" |
   "H1" | "H2" | "H3" | "H4" | "H5" | "H6" | "H7" | "H8" | "H9" |
   "J1" | "J2" | "J3" | "J4" | "J5" | "J6" | "J7" | "J8" | "J9"
export const MAX_CELL_INDEX = 80
export const ALL_CANDIDATES = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const
export const ROW_NAMES = ["A", "B", "C", "D", "E", "F", "G", "H", "J"] as const
export const COLUMN_NAMES = ["1", "2", "3", "4", "5", "6", "7", "8", "9"] as const
export const BOX_NAMES = ["1", "2", "3", "4", "5", "6", "7", "8", "9"] as const

////////////
// React types

export type _ReactProps = typeof React.Component.prototype.props
export type _UnusedProps = typeof React.Component.prototype.props


////////////
// Utility types

export type TwoDimensionalArray<T> = Array<Array<T>>

// Credits to https://stackoverflow.com/a/50769802/12174015
export type Mutable<T> = {
   -readonly [P in keyof T]: T[P];
}

export type DontUseObject = Record<PropertyKey, unknown>

////////////
// Typescript workarounds

// 1. optional whenConstruct
export type PossibleConstructCallback = Readonly<{
   whenConstruct?(...args: any): any
}> & _ReactProps

export type GuaranteedConstructCallback = Readonly<{
   whenConstruct(...args: any): any
}> & _ReactProps

export function HasWhenConstruct(obj: DontUseObject): obj is GuaranteedConstructCallback {
   return "whenConstruct" in obj
}
