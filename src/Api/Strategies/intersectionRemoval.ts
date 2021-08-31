import { ALL_CANDIDATES, INDICES_TO_NINE, SudokuDigits } from "../../Types";
import PureSudoku from "../Spaces/PureSudoku";
import Solver from "../Solver";
import Sudoku from "../Spaces/Sudoku";
import { boxAt, CellID } from "../Utils";

/**
 * Colors a group of cells, see Cell#highlight
 */
export function colorGroup(sudoku: PureSudoku, group: Iterable<CellID>, candidate: SudokuDigits, color = 'blue') {
   if (sudoku instanceof Sudoku) {
      for (const cell of group) {
         const element = sudoku.cells[cell.row][cell.column]
         element?.highlight([candidate], color)
      }
   }
}

/**
 * If all candidate N in group G attacks range R,
 * you can remove N from R
 */
export default function intersectionRemoval(sudoku: PureSudoku, _solver: Solver) {
   function _removeCandidate(candidate: SudokuDigits, cellID: CellID) {
      const newCandidates = sudoku.data[cellID.row][cellID.column]
      newCandidates.splice(newCandidates.indexOf(candidate), 1)
      sudoku.set(cellID.row, cellID.column).to(...newCandidates)

      candidateLocations[candidate].rows[cellID.row].delete(cellID)
      candidateLocations[candidate].columns[cellID.column].delete(cellID)
      candidateLocations[candidate].boxes[boxAt(cellID.row, cellID.column)].delete(cellID)
   }


   // The comments will say "row" instead of "group2" but it could also be "column"
   function _innerTwoGroupLogic(
      candidate: SudokuDigits,
      boxLocations: Set<CellID>,
      group2Locations: Set<CellID>,
   ) {
      // boxDiff is a copy of boxLocations
      const boxDiff = new Set(boxLocations) // Box locations not in row
      const group2Diff = new Set<CellID>() // Row locations not in box

      for (const group2Location of group2Locations) {
         if (boxDiff.has(group2Location)) {
            boxDiff.delete(group2Location)
         } else {
            group2Diff.add(group2Location)
         }
      }

      // In (row and box), but not (rest of box)
      if (boxDiff.size === 0 && group2Diff.size !== 0) {
         successcount++
         colorGroup(sudoku, boxLocations, candidate)
         for (const extraCell of group2Diff) {
            _removeCandidate(candidate, extraCell)
         }
      }

      // In (row and box), but not (rest of row)
      if (group2Diff.size === 0 && boxDiff.size !== 0) {
         successcount++
         colorGroup(sudoku, group2Locations, candidate)
         for (const extraCell of boxDiff) {
            _removeCandidate(candidate, extraCell)
         }
      }
   }


   let successcount = 0
   const candidateLocations = sudoku.getCandidateLocations()
   for (const candidate of ALL_CANDIDATES) {
      // Boxes vs Rows (and) Boxes vs Columns
      for (const box of INDICES_TO_NINE) {
         const boxLocations = candidateLocations[candidate].boxes[box]

         for (const groupIndex of INDICES_TO_NINE) {
            const rowLocations = candidateLocations[candidate].rows[groupIndex]
            const columnLocations = candidateLocations[candidate].columns[groupIndex]

            if (boxLocations.size < 4 || rowLocations.size < 4) {
               _innerTwoGroupLogic(candidate, boxLocations, rowLocations)
            }

            if (boxLocations.size < 4 || columnLocations.size < 4) {
               _innerTwoGroupLogic(candidate, boxLocations, columnLocations)
            }
         }
      }
   }

   if (successcount === 0) {
      return {
         success: false
      } as const
   }

   return {
      success: true,
      successcount
   } as const
}
