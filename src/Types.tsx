
import React from 'react';

export type SudokuDigits = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
export type IndexToNine = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
export const MAX_CELL_INDEX = 80
export const ROW_NAMES = ["A", "B", "C", "D", "E", "F", "G", "H", "J"] as const
export const COLUMN_NAMES = ["1", "2", "3", "4", "5", "6", "7", "8", "9"] as const

export type TwoDimensionalArray<T> = Array<Array<T>>

// The following are Typescript workarounds

// 1. optional whenConstruct
export type PossibleConstructCallback = Readonly<{
   whenConstruct?(...args: any): any
} & typeof React.Component.prototype.props>

export type GuaranteedConstructCallback = Readonly<{
   whenConstruct(...args: any): any
} & typeof React.Component.prototype.props>

export function HasWhenConstruct(obj: object): obj is GuaranteedConstructCallback {
   return "whenConstruct" in obj
}
