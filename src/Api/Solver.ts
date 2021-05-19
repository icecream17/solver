import SolverPart from "../Elems/AsideElems/SolverPart"
import StrategyItem from "../Elems/AsideElems/StrategyItem"
import Strategies from "./Strategies"
import Sudoku from "./Sudoku"

export default class Solver {
   strategyIndex: number
   solved: number
   strategyItemElements: StrategyItem[]
   constructor (public sudoku: null | Sudoku, public solverElement: SolverPart) {
      this.strategyIndex = 0
      this.solved = 0
      this.strategyItemElements = []

      this.Go = this.Go.bind(this)
      this.Step = this.Step.bind(this)
      this.Undo = this.Undo.bind(this)
   }

   Step () {
      if (this.sudoku === null) {
         if (this.solverElement.props.sudoku === null) {
            throw ReferenceError('Uninitialized sudoku!')
         } else {
            this.sudoku = this.solverElement.props.sudoku
         }
      }

      const strategyResult = Strategies[this.strategyIndex](this.sudoku, this)
      if (this.strategyIndex in this.strategyItemElements) {
         this.strategyItemElements[this.strategyIndex].setState({
            success: strategyResult.success,
            successcount: strategyResult.successcount
         })
      } else {
         console.warn(`undefined strategyItemElement @${this.strategyIndex}`)
      }

      if (strategyResult.success) {
         this.strategyIndex = 0
      } else {
         this.strategyIndex++
         if (this.strategyIndex === Strategies.length) {
            this.strategyIndex = 0
         }
      }

      return strategyResult
   }

   /** Does "Step" until it reaches the end or a strategy succeeds */
   Go () {
      do {
         this.Step()
      } while (this.strategyIndex !== 0)
   }

   Undo () {
      // TODO
   }
}
