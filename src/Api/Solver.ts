import Sudoku from "./Sudoku"

export default class Solver {
   sudoku: Sudoku
   strategyIndex: number
   constructor (sudoku: Sudoku) {
      this.sudoku = sudoku
      this.strategyIndex = 0
      console.debug(this)
   }

   Step () {
      // TODO
   }

   /** Does "Step" until it reaches the end or a strategy succeeds */
   Go () {
      // TODO
   }

   Undo () {
      // TODO
   }
}
