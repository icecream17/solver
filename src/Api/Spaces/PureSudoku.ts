import { ALL_CANDIDATES, GrpTyp, IndexToNine, INDICES_TO_NINE, SudokuDigits, ThreeDimensionalArray } from "../../Types"
import { boxAt, CellID, id, to9by9 } from "../Utils"

export type CandidateLocations = Record<GrpTyp, Set<CellID>[]>

function Cell (id: CellID, cell: SudokuDigits[]) {
   return {
      candidates: cell,
      position: id
   }
}

/**
 * Defines base sudoku methods
 * Should I move these to utils?
 */
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
    * Convert the sudoku into 81 digits
    * "0" = a cell with no candidates
    * "." = an unsolved cell
    */
   to81 () {
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
    * Same as to81 but every cell is represented by
    * its candidates. No newlines.
    * Missing candidates are represented by "."
    */
   to729 () {
      let str = ""
      for (const row of this.data) {
         for (const cell of row) {
            for (const candidate of ALL_CANDIDATES) {
               str += cell.includes(candidate) ? candidate : "."
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
                  .filter(candidate => "123456789".includes(candidate))
                  .map(candidate => Number(candidate) as SudokuDigits)
            )

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
      const onlyDigitRepresentation = representation.replaceAll(/\D/g, "")
      const oneToNineOrDot = representation.replaceAll(/[^.1-9]/g, "")

      for (const testRepresentation of [representation, representationWithoutWhitespace, onlyDigitRepresentation, oneToNineOrDot] as const) {
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
         .split(/\s+/) // split ignores g flag

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

   // WARNING: The "candidates" aren't checked (other than the static type checking)
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

   getBoxGroup<T>(index: IndexToNine, data: T[][]) {
      const startRow = index - (index % 3)
      const startColumn = (index % 3) * 3
      return data.slice(startRow, startRow + 3).flatMap(row => row.slice(startColumn, startColumn + 3))
   }

   /**
    * A group is a set of maximally mutually exclusive set of cells.
    * 
    * Currently, we assume this is just the rows, columns, and boxes, but this will be changed later on.
    */
   getGroups() {
      const groups = []
      const cellData = this.data.map((row, indexOfRow) =>
         row.map((cell, indexInRow) => Cell(id(indexOfRow as IndexToNine, indexInRow as IndexToNine), cell))
      )

      for (const i of INDICES_TO_NINE) {
         groups.push(
            cellData[i],
            cellData.map(row => row[i]),
            this.getBoxGroup(i, cellData)
         )
      }

      return groups
   }

   /**
    * Returns the candidate locations of the sudoku
    *
    * @misnomer
    * getCandidatesLocations
    *
    * @example
    *
    * ```ts
    * sudoku.getCandidatesLocations()[candidate].rows[5]
    * // > Set<CellID>
    * // set of cells with that candidate
    * ```
    *
    * Return type is an array of
    * ```
    * CandidateLocations: {
    *    rows: [Set<CellID> for each index]
    *    columns: [Set<CellID> for each index]
    *    boxes: [Set<CellID> for each index]
    * }
    * ```
    */
   getCandidateLocations(): CandidateLocations[] {
      const candidateLocations = [] as CandidateLocations[]

      for (const candidate of ALL_CANDIDATES) {
         candidateLocations[candidate] = {
            row: [new Set<CellID>(), new Set<CellID>(), new Set<CellID>(), new Set<CellID>(), new Set<CellID>(), new Set<CellID>(), new Set<CellID>(), new Set<CellID>(), new Set<CellID>()],
            column: [new Set<CellID>(), new Set<CellID>(), new Set<CellID>(), new Set<CellID>(), new Set<CellID>(), new Set<CellID>(), new Set<CellID>(), new Set<CellID>(), new Set<CellID>()],
            box: [new Set<CellID>(), new Set<CellID>(), new Set<CellID>(), new Set<CellID>(), new Set<CellID>(), new Set<CellID>(), new Set<CellID>(), new Set<CellID>(), new Set<CellID>()]
         }
      }

      for (const row of INDICES_TO_NINE) {
         for (const column of INDICES_TO_NINE) {
            const cellID = id(row, column)
            for (const candidate of this.data[row][column]) {
               candidateLocations[candidate].row[row].add(cellID)
               candidateLocations[candidate].column[column].add(cellID)
               candidateLocations[candidate].box[boxAt(row, column)].add(cellID)
            }
         }
      }

      return candidateLocations
   }

   /**
    * Removes a candidate at a cell
    *
    * @example
    * (new PureSudoku()).remove(7).at(3, 5)
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

