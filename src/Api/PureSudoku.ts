// @flow
import { IndexToNine, SudokuDigits, ThreeDimensionalArray } from "../Types"
import { to9by9 } from "./Utils"

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
         console.warn('PureSudoku: Representation given but setup === false. Ignoring representation.')
      }
      if (options.representationType != null) {
         console.warn('PureSudoku: Representation type given but setup === false. Ignoring representation type.')
      }
      return {
         setup: false
      } as const
   }
}

export default class PureSudoku {
   data: ThreeDimensionalArray<SudokuDigits>
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

   static from81<T extends typeof PureSudoku>(this: T, representation: string): InstanceType<T> {
      return new this({
         setup: true,
         representationType: '81',
         representation
      }) as InstanceType<T>
   }

   /**
    * Currently for debugging
    */
   _to81() {
      let str = ""
      for (const row of this.data) {
         for (const cell of row) {
            if (cell.length === 1) {
               str += cell[0]
            } else if (cell.length === 0) {
               str += "0"
            } else {
               str += "."
            }
         }
         str += "\n"
      }
      return str
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

   /**
    * Imports from a 729 character string, where every 9 candidates
    * specify candidates for a cell
    */
   import729(representation: string): void {
      let totalIndex = 0
      for (let i: IndexToNine = 0; i < 9; i = i + 1 as IndexToNine) {
         for (let j: IndexToNine = 0; j < 9; j = j + 1 as IndexToNine) {
            const candidateData = (
               representation.slice(totalIndex * 9, totalIndex * 9 + 9)
                  .split('')
                  .map(
                     candidate => "123456789".includes(candidate)
                        ? Number(candidate) as SudokuDigits
                        : null
                  ).filter(candidate => candidate !== null)
            ) as SudokuDigits[]

            totalIndex++
            this.set(i, j).to(...candidateData)
         }
      }
   }

   importGrid(gridRepresentation: ThreeDimensionalArray<SudokuDigits>) {
      for (let i: IndexToNine = 0; i < 9; i = i + 1 as IndexToNine) {
         for (let j: IndexToNine = 0; j < 9; j = j + 1 as IndexToNine) {
            this.set(i, j).to(...gridRepresentation[i][j])
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

      if (representation.length === 729) {
         this.import729(representation)
         return {
            success: true,
            representationType: '729'
         } as const
      }

      const gridRepresentation = representation
         .split('')
         .filter(char => "123456789 ".includes(char))
         .join('')
         .trim()
         .split(/\s+/g)

      if (gridRepresentation.length === 81) {
         this.importGrid(
            to9by9(
               gridRepresentation.map(
                  a => a.split('').map(b => Number(b) as SudokuDigits)
               )
            )
         )

         return {
            success: true,
            representationType: 'grid'
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

