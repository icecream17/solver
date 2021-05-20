
import React from 'react';

export type SudokuDigits = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
export type IndexToNine = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
export const MAX_CELL_INDEX = 80

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
