// @flow

import PureSudoku from "./Spaces/PureSudoku";

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
   ((arg: PureSudoku, memory: StrategyMemory[number]) => StrategyResult)
)

// Information strategies might want to know
export class StrategyMemory extends Array {
   public [0] = { solved: 0 }
}
