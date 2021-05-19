import { IndexToNine } from "../Types";
import PureSudoku from "./PureSudoku";
import { Strategy, StrategyError } from "./Types";
import { algebraic } from "./Utils";

type validityResult = {
   ok: true
} | {
   ok: false,
   message: string
}

export function checkValidity(sudoku: PureSudoku): validityResult {
   for (let i: IndexToNine = 0; i < sudoku.data.length; i++ as IndexToNine) {
      for (let j: IndexToNine = 0; j < sudoku.data[i].length; j++ as IndexToNine) {
         const candidates = sudoku.data[i as IndexToNine][j as IndexToNine]
         if (candidates.length === 0) {
            return {
               ok: false,
               message: `Cell ${algebraic(i as IndexToNine, j as IndexToNine)} has 0 possible candidates!`
            }
         }
      }
   }
   return {
      ok: true
   }
}


// See comments on `Strategy`
export default [
   function checkForSolved (sudoku, solver) {
      const validity = checkValidity(sudoku)
      if (!validity.ok) {
         alert(validity.message)
         return {
            success: true,
            message: validity.message,
            successcount: -1
         } as StrategyError
      }

      if (solver.solved === 64) {
         alert("Finished! :D")
         return {
            success: true,
            successcount: 64
         }
      }

      let totalSolved = 0
      for (const row of sudoku.data) {
         for (const cellCandidates of row) {
            if (cellCandidates.length === 1) {
               totalSolved++
            }
         }
      }

      if (totalSolved > solver.solved) {
         const difference = totalSolved - solver.solved
         solver.solved = totalSolved
         return {
            success: true,
            successcount: difference
         }
      }

      return {
         success: false
      }
   }
] as Strategy[]
