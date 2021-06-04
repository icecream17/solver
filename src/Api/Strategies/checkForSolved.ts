import { NUMBER_OF_CELLS } from "../../Types"
import Solver from "../Solver"
import Sudoku from "../Sudoku"
import checkValidity from "./checkValidity"

export default function checkForSolved(sudoku: Sudoku, solver: Solver) {
   const validity = checkValidity(sudoku)
   if (!validity.ok) {
      window._custom.alert(validity.message)
      return {
         success: true,
         message: validity.message,
         successcount: -1
      } as const
   }

   // Should this be before checkValidity?
   if (typeof solver.solved !== "number") {
      throw TypeError(`solver.solved is not a number - got ${String(solver.solved)}`)
   } else if (!Number.isInteger(solver.solved)) {
      throw TypeError(`solver.solved is not an integer - got ${solver.solved}`)
   } else if (0 > solver.solved || solver.solved > NUMBER_OF_CELLS) {
      throw TypeError(`impossible amount of solver.solved - got ${solver.solved}`)
   }

   if (solver.solved === NUMBER_OF_CELLS) {
      window._custom.alert("Finished! :D")
      return {
         success: true,
         successcount: NUMBER_OF_CELLS
      } as const
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
      } as const
   }

   return {
      success: false
   } as const
}
