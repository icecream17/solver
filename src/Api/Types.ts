// @flow

import PureSudoku from "./PureSudoku";
import Solver from "./Solver";
import Sudoku from "./Sudoku";

export const SuccessError = -1
export type StrategyResult = Readonly<{
   success: true,
   successcount: number,
   message?: string
} | {
   success: false,
   successcount?: number,
   message?: string
}>
export type StrategyError = Readonly<{
   success: false,
   successcount: typeof SuccessError,
   message?: string
}>
export type Strategy = (
   ((arg: PureSudoku, solver: Solver) => StrategyResult) |
   ((arg: Sudoku, solver: Solver) => StrategyResult)
)
