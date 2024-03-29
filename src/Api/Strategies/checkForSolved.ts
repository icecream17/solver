import { AlertType, NUMBER_OF_CELLS } from "../../Types"
import PureSudoku from "../Spaces/PureSudoku"
import { StrategyMemory, SuccessError } from "../Types"
import { numberOfCellsWithNCandidates } from "../Utils.dependent"
import checkValidity from "./checkValidity"

export default function checkForSolved(sudoku: PureSudoku, memory: StrategyMemory[0]) {
   const validity = checkValidity(sudoku)
   if (!validity.ok) {
      window._custom.alert(validity.message, AlertType.ERROR)
      return {
         success: false,
         message: validity.message,
         successcount: SuccessError,
      } as const
   }

   // Should this be before checkValidity?
   if (typeof memory.solved !== "number") {
      throw TypeError(`memory.solved is not a number - got ${String(memory.solved)}`)
   } else if (!Number.isInteger(memory.solved)) {
      throw TypeError(`memory.solved is not an integer - got ${memory.solved}`)
   } else if (0 > memory.solved || memory.solved > NUMBER_OF_CELLS) {
      throw TypeError(`impossible amount of memory.solved - got ${memory.solved}`)
   }

   const totalSolved = numberOfCellsWithNCandidates(sudoku, 1)
   if (totalSolved === NUMBER_OF_CELLS) {
      memory.solved = NUMBER_OF_CELLS
      return {
         success: true,
         successcount: NUMBER_OF_CELLS
      } as const
   }

   if (totalSolved !== memory.solved) {
      const difference = totalSolved - memory.solved
      memory.solved = totalSolved

      return {
         success: true,
         successcount: difference
      } as const
   }

   return {
      success: false
   } as const
}
