import { SudokuDigits } from "./types";
import Board from "./board";
import { CellID } from "./geometry";

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

export type PureStrategy = (arg: Board) => StrategyResult
type StatefulStrategy = (arg: Board, memory: StrategyMemory[number]) => StrategyResult
export type Strategy = StatefulStrategy

// Group types
export type CellInfo = {
   candidates: SudokuDigits[]
   position: CellID
}

export type CellGroup = CellInfo[]


// Information strategies might want to know
export class StrategyMemory extends Array {
   public [0] = { solved: 0 }
}
