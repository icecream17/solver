// @flow

import PureSudoku from "./Spaces/PureSudoku";
import Solver from "./Solver";

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
   ((arg: PureSudoku) => StrategyResult) |
   ((arg: PureSudoku, solver: Solver) => StrategyResult)
)
