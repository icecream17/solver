// @flow
import { ALL_CANDIDATES, IndexToNine, INDICES_TO_NINE, SudokuDigits, ThreeDimensionalArray } from "../../Types"
import { boxAt, CellID, id, to9by9 } from "../Utils"

export default class PureSudoku {
   data: ThreeDimensionalArray<SudokuDigits>
   constructor(representation?: string) {
      this.data = [
         [], [], [],
         [], [], [],
         [], [], [],
      ]

      for (let i = 0; i < 9; i++) {
         for (let j = 0; j < 9; j++) {
            this.data[i][j] = [1, 2, 3, 4, 5, 6, 7, 8, 9]
         }
      }

      if (typeof representation === "string") {
         this.import(representation)
      }
   }

   static fromRepresentation<T extends typeof PureSudoku>(this: T, representation: string): InstanceType<T> {
      return new this(representation) as InstanceType<T>
   }

   /**
    * Currently for debugging
    */
   _to81 () {
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
    * Currently for debugging
    * But also used in the "export" button
    */
   to729 () {
      let str = ""
      for (const row of this.data) {
         for (const cell of row) {
            for (const candidate of ALL_CANDIDATES) {
               if (cell.includes(candidate)) {
                  str += candidate
               } else {
                  str += "0"
               }
            }
         }
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
      for (const i of INDICES_TO_NINE) {
         for (const j of INDICES_TO_NINE) {
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
      for (const i of INDICES_TO_NINE) {
         for (const j of INDICES_TO_NINE) {
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
      for (const i of INDICES_TO_NINE) {
         for (const j of INDICES_TO_NINE) {
            this.set(i, j).to(...gridRepresentation[i][j])
         }
      }
   }

   // Note: import is a keyword, but it doesn't cause a syntax error here
   import(representation: string) {
      representation = representation.trim().normalize()
      const representationWithoutWhitespace = representation.replaceAll(/\s/g, "")

      for (const testRepresentation of [representation, representationWithoutWhitespace] as const) {
         if (testRepresentation.length === 81) {
            this.import81(testRepresentation)
            return {
               success: true,
               representationType: '81'
            } as const
         }

         if (testRepresentation.length === 729) {
            this.import729(testRepresentation)
            return {
               success: true,
               representationType: '729'
            } as const
         }
      }


      const gridRepresentation = representation
         .split('')
         .filter(char => "123456789 ".includes(char))
         .join('')
         .trim()
         .split(/\s+/g) // Could change `\s` to ` `

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

   clearCell(x: IndexToNine, y: IndexToNine) {
      this.set(x, y).to(1, 2, 3, 4, 5, 6, 7, 8, 9)
   }

   clear() {
      for (const i of INDICES_TO_NINE) {
         for (const j of INDICES_TO_NINE) {
            this.clearCell(i, j)
         }
      }
   }

   getColumn(index: IndexToNine) {
      return this.data.map(row => row[index])
   }

   getBox(index: IndexToNine) {
      // 0 1 2 -> 0 3 6
      const startRow = index - (index % 3) // / 3 * 3
      const startColumn = (index % 3) * 3
      return this.data.slice(startRow, startRow + 3).flatMap(row => row.slice(startColumn, startColumn + 3))
   }

   /**
    * Returns the candidate locations of the sudoku
    *
    * Returns: [undefined, candidate1Data, candidate2Data, ...]
    *
    * candidateNData: {
    *    rows: [Set<CellID> for each index]
    *    columns: [Set<CellID> for each index]
    *    boxes: [Set<CellID> for each index]
    * }
    *
    */
   getCandidateLocations() {
      const candidateLocations = [undefined] as [undefined, ...({
         rows: Set<CellID>[]
         columns: Set<CellID>[]
         boxes: Set<CellID>[]
      })[]]

      for (const candidate of ALL_CANDIDATES) {
         candidateLocations[candidate] = {
            rows: [new Set<CellID>(), new Set<CellID>(), new Set<CellID>(), new Set<CellID>(), new Set<CellID>(), new Set<CellID>(), new Set<CellID>(), new Set<CellID>(), new Set<CellID>()],
            columns: [new Set<CellID>(), new Set<CellID>(), new Set<CellID>(), new Set<CellID>(), new Set<CellID>(), new Set<CellID>(), new Set<CellID>(), new Set<CellID>(), new Set<CellID>()],
            boxes: [new Set<CellID>(), new Set<CellID>(), new Set<CellID>(), new Set<CellID>(), new Set<CellID>(), new Set<CellID>(), new Set<CellID>(), new Set<CellID>(), new Set<CellID>()]
         }
      }

      for (const row of INDICES_TO_NINE) {
         for (const column of INDICES_TO_NINE) {
            const cellID = id(row, column)
            for (const candidate of this.data[row][column]) {
               candidateLocations[candidate].rows[row].add(cellID)
               candidateLocations[candidate].columns[column].add(cellID)
               candidateLocations[candidate].boxes[boxAt(row, column)].add(cellID)
            }
         }
      }

      return candidateLocations
   }

   /**
    * Removes a candidate at a cell
    *
    * @example
    * (new PureSudoku()).toggle(7).at(3, 5)
    */
   remove(candidate: SudokuDigits) {
      // Using an arrow function here to use `this`
      return {
         at: (row: IndexToNine, column: IndexToNine) => {
            this.set(row, column).to(
               ...this.data[row][column].filter(candidatee => candidatee !== candidate)
            )
         }
      }
   }
}

