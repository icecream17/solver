import PureSudoku from "./PureSudoku";
import Solver from "./Solver";
import Sudoku from "./Sudoku";

// error = success: true, successcount: -1
export type StrategyResult = Readonly<{
   success: true,
   successcount: number,
   message?: string
}> | Readonly<{
   success: false,
   successcount: number,
}>
export type StrategyError = Readonly<{
   success: true,
   successcount: -1,
   message?: string
}>
export type Strategy = (
   ((arg: PureSudoku, solver: Solver) => StrategyResult) |
   ((arg: Sudoku, solver: Solver) => StrategyResult)
)
