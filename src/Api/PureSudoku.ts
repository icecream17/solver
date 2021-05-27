// @flow
import { IndexToNine, SudokuDigits } from "../Types"

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

function coalesceConstructorOptions (options: SudokuConstructorOptions): Readonly<SudokuConstructorOptions> {
   options.setup ??= true
   if (options.setup) {
      options.representation ??= null
      options.representationType ??= null
      if (options.representationType === null) {
         return {
            setup: true,
            representationType: null,
            representation: null
         } as const
      } else if (options.representation === null) {
         throw TypeError('PureSudoku: representationType provided but not representation')
      } else {
         return {
            setup: true,
            representationType: options.representationType,
            representation: options.representation
         } as const
      }
   } else {
      if (options.representation != null) {
         console.warn('PureSudoku: Representation given but setup === false')
      }
      if (options.representationType != null) {
         console.warn('PureSudoku: Representation type given but setup === false')
      }
      return {
         setup: false
      } as const
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

   /**
    * Imports from an 81 character string representing a sudoku.
    *
    * Any character that is not a digit is a blank cell.
    */
   import81(representation: string): void {
      let totalIndex = 0
      for (let i: IndexToNine = 0; i < 9; i = i+1 as IndexToNine) {
         for (let j: IndexToNine = 0; j < 9; j = j+1 as IndexToNine) {
            const char = representation[totalIndex]
            totalIndex++ // after char

            // Using `this.set` for compatibility with `Sudoku`
            if ("123456789".includes(char)) {
               this.set(i, j).to(Number(char) as SudokuDigits)
            } else {
               this.set(i, j).to(1, 2, 3, 4, 5, 6, 7, 8, 9)
            }
         }
      }
   }

   // Note: import is a keyword, but it doesn't cause a syntax error here
   import(representation: string) {
      representation = representation.trim().normalize()
      if (representation.length === 81) {
         this.import81(representation)
         return {
            success: true,
            representationType: '81'
         } as const
      }

      return {
         success: false
      } as const
   }

   // WARNING: No checks are done on "candidates" expect for the static type checking
   set(x: IndexToNine, y: IndexToNine) {
      return {
         to: (...candidates: SudokuDigits[]) => {
            this.data[x][y] = candidates
         }
      }
   }
}

