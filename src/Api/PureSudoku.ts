import { IndexToNine, SudokuDigits } from "../Types"
import Sudoku from "./Sudoku"

type TwoDimensionalArray<T> = Array<Array<T>>

export type SudokuConstructorOptions = {
   setup: false
   representationType?: never
   representation?: never
} | {
   setup?: true
   representationType?: null
   representation?: null
} | {
   setup?: true
   representationType: string
   representation: string
}

function coalesceConstructorOptions (options: SudokuConstructorOptions) {
   options.setup ??= true
   if (options.setup) {
      options.representation ??= null
      options.representationType ??= null
      if (options.representationType === null) {
         return {
            setup: true,
            representationType: null,
            representation: null
         }
      } else if (options.representation === null) {
         throw TypeError('PureSudoku: representationType provided but not representation')
      } else {
         return {
            setup: true,
            representationType: options.representationType,
            representation: options.representation
         }
      }
   } else {
      if (options.representation != null) {
         console.warn('PureSudoku: Representation given but setup === false')
      }
      if (options.representationType != null) {
         console.warn('PureSudoku: Representation type given but setup === false')
      }
      return {
         setup: false,
         representationType: undefined,
         representation: undefined
      }
   }
}

export default class PureSudoku {
   data: TwoDimensionalArray<SudokuDigits[]>
   constructor(options: SudokuConstructorOptions = {}) {
      const checkedOptions = coalesceConstructorOptions(options)
      this.data = [
         [], [], [],
         [], [], [],
         [], [], [],
      ]

      if (checkedOptions.setup) {
         if (checkedOptions.representationType === '81') {
            let totalIndex = 0
            for (let i = 0; i < 9; i++) {
               for (let j = 0; j < 9; j++) {
                  const char = checkedOptions.representation[totalIndex]
                  totalIndex++ // After char

                  if ("123456789".includes(char)) {
                     this.data[i][j] = [Number(char) as SudokuDigits]
                  } else {
                     this.data[i][j] = [1, 2, 3, 4, 5, 6, 7, 8, 9]
                  }
               }
            }
         } else {
            for (let i = 0; i < 9; i++) {
               for (let j = 0; j < 9; j++) {
                  this.data[i][j] = [1, 2, 3, 4, 5, 6, 7, 8, 9]
               }
            }
         }
      } else {
         for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
               this.data[i][j] = []
            }
         }
      }
   }

   // static from81(representation: string, constructor: typeof PureSudoku): PureSudoku
   // static from81(representation: string, constructor: typeof Sudoku): Sudoku
   // static from81(representation: string, constructor: any) {
   //    return new constructor({
   //       setup: true,
   //       representationType: '81',
   //       representation
   //    })
   // }

   static from81<T extends typeof PureSudoku>(this: T, representation: string): InstanceType<T> {
      return new this({
         setup: true,
         representationType: '81',
         representation
      }) as InstanceType<T>
   }


   set(x: IndexToNine, y: IndexToNine) {
      return {
         to: (...candidates: SudokuDigits[]) => {
            this.data[x][y] = candidates
         }
      }
   }
}

