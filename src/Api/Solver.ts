import Sudoku from "./Sudoku"

export default class Solver {
   strategyIndex: number
   constructor (public sudoku: null | Sudoku) {
      this.strategyIndex = 0
      console.debug(this)
      // @ts-ignore
      globalThis.___ = this
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
