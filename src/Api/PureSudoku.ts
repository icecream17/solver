import { IndexToNine, SudokuDigits } from "../Types"

type TwoDimensionalArray<T> = Array<Array<T>>

export default class PureSudoku {
   data: TwoDimensionalArray<SudokuDigits[]>
   constructor({ setup=true, representation=null }={}) {
      this.data = [
         [], [], [],
         [], [], [],
         [], [], [],
      ]

      if (setup) {
         for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
               this.data[i][j] = [1, 2, 3, 4, 5, 6, 7, 8, 9]
            }
         }
      }
   }

   setCandidates(x: IndexToNine, y: IndexToNine, candidates: SudokuDigits[]) {
      this.data[x][y] = candidates
   }

   from81(representation: string) {
      for (let i = 0; i < 9; i++) {
         for (let j = 0; j < 9; j++) {
            this.data[i][j] = [Number(representation[i * 9 + j]) as SudokuDigits]
         }
      }
   }
}
