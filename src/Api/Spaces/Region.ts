import { IndexToNine, INDICES_TO_NINE, SudokuDigits } from "../../Types";
import { RegionLine } from "./Line";
import PureSudoku from "./PureSudoku";

// For now
type RegionOptions = {
   type: "candidate",
   candidate: SudokuDigits,
}

export default class Region extends Array<Array<boolean>> {
   /** O(n^3) */
   constructor (public sudoku: PureSudoku, options?: RegionOptions) {
      super(
         [false, false, false, false, false, false, false, false, false],
         [false, false, false, false, false, false, false, false, false],
         [false, false, false, false, false, false, false, false, false],
         [false, false, false, false, false, false, false, false, false],
         [false, false, false, false, false, false, false, false, false],
         [false, false, false, false, false, false, false, false, false],
         [false, false, false, false, false, false, false, false, false],
         [false, false, false, false, false, false, false, false, false],
         [false, false, false, false, false, false, false, false, false],
      )

      if (options?.type === "candidate") {
         for (const row of INDICES_TO_NINE) {
            for (const column of INDICES_TO_NINE) {
               if (sudoku.data[row][column].includes(options.candidate)) {
                  this[row][column] = true
               }
            }
         }
      }
   }

   /** O(n^2) */
   lines() {
      const rows = [] as RegionLine[]
      const columns = [] as RegionLine[]
      for (const index of INDICES_TO_NINE) {
         rows.push(new RegionLine(this, "row", index))
         columns.push(new RegionLine(this, "column", index))
      }
      return { rows, columns }
   }

   column(index: IndexToNine) {
      return this.map(row => row[index])
   }
}
