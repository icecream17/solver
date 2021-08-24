import { ALL_CANDIDATES, IndexToNine } from "../../Types";
import Solver from "../Solver";
import PureSudoku from "../Spaces/PureSudoku";
import Region from "../Spaces/Region";
import { affects, CellID, id, sharedArray } from "../Utils";
import { colorGroup } from "./intersectionRemoval";

/**
 * Disjointed x wing - see Strategies.md
 *
 * Two lines - 1 cross line = extra
 * If all extra see n, n is eliminated (since extra must have at least 1)
 */
export default function skyscraper(sudoku: PureSudoku, _solver: Solver) {
   for (const candidate of ALL_CANDIDATES) {
      const region = new Region(sudoku, { type: "candidate", candidate })
      const lines = region.lines()
      const has = {
         rows: lines.rows.map(row => row.true()),
         columns: lines.columns.map(column => column.true())
      }

      const twoHas = {
         rows: has.rows.map(row => row.length === 2 ? row : undefined),
         columns: has.columns.map(column => column.length === 2 ? column : undefined)
      }

      for (const [index1, row1] of twoHas.rows.entries()) {
         if (row1 === undefined) continue;
         for (const [index2, row2] of twoHas.rows.entries()) {
            if (row2 === undefined) continue;

            const positions = new Set<CellID>()
            const columns = new Set<IndexToNine>()
            const shared = [] as IndexToNine[]
            for (const cell of row1) {
               positions.add(id(index1 as IndexToNine, cell)) //
               columns.add(cell)
            }
            for (const cell of row2) {
               positions.add(id(index2 as IndexToNine, cell)) //
               if (columns.has(cell)) {
                  shared.push(cell)
               } else {
                  columns.add(cell)
               }
            }

            if (shared.length === 1) {
               const extra = Array.from(positions).filter(cell => cell.column !== shared[0]) //
               const affects1 = affects(extra[0].row, extra[0].column)
               const affects2 = affects(extra[1].row, extra[1].column)
               const sharedAffects = sharedArray(affects1, affects2).filter(cell =>
                  sudoku.data[cell.row][cell.column].includes(candidate)
               )
               if (sharedAffects.length !== 0) {
                  colorGroup(sudoku, positions, candidate)
                  for (const cell of sharedAffects) {
                     sudoku.toggle(candidate).at(cell.row, cell.column)
                  }

                  return {
                     success: true,
                     successcount: 1,
                  } as const
               }
            }
         }
      }

      // dry code for columns
      for (const [index1, column1] of twoHas.columns.entries()) {
         if (column1 === undefined) continue;
         for (const [index2, column2] of twoHas.columns.entries()) {
            if (column2 === undefined) continue;

            const positions = new Set<CellID>()
            const columns = new Set<IndexToNine>()
            const shared = [] as IndexToNine[]
            for (const cell of column1) {
               positions.add(id(cell, index1 as IndexToNine)) // Different from rows indicator
               columns.add(cell)
            }
            for (const cell of column2) {
               positions.add(id(cell, index2 as IndexToNine)) //
               if (columns.has(cell)) {
                  shared.push(cell)
               } else {
                  columns.add(cell)
               }
            }

            if (shared.length === 1) {
               const extra = Array.from(positions).filter(cell => cell.row !== shared[0]) //
               const affects1 = affects(extra[0].row, extra[0].column)
               const affects2 = affects(extra[1].row, extra[1].column)
               const sharedAffects = sharedArray(affects1, affects2).filter(cell =>
                  sudoku.data[cell.row][cell.column].includes(candidate)
               )
               if (sharedAffects.length !== 0) {
                  colorGroup(sudoku, positions, candidate)
                  for (const cell of sharedAffects) {
                     sudoku.toggle(candidate).at(cell.row, cell.column)
                  }

                  return {
                     success: true,
                     successcount: 1,
                  } as const
               }
            }
         }
      }
   }

   return {
      success: false
   } as const
}
