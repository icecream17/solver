import { ALL_CANDIDATES, INDICES_TO_NINE, SudokuDigits } from "../../Types";
import PureSudoku from "../Spaces/PureSudoku";
import { boxAt, CellID, removeFromArray } from "../Utils";
import { colorGroup } from "../Utils.dependent";

/**
 * If all candidate N in group G attacks range R,
 * you can remove N from R
 */
export default function intersectionRemoval(sudoku: PureSudoku) {
   const messages = new Set<string>()

   function _removeCandidate(candidate: SudokuDigits, cellID: CellID) {
      const newCandidates = sudoku.data[cellID.row][cellID.column]
      removeFromArray(candidate, newCandidates)
      sudoku.set(cellID.row, cellID.column).to(...newCandidates)

      candidateLocations[candidate].row[cellID.row].delete(cellID)
      candidateLocations[candidate].column[cellID.column].delete(cellID)
      candidateLocations[candidate].box[boxAt(cellID.row, cellID.column)].delete(cellID)
   }


   function _innerTwoGroupLogic(
      candidate: SudokuDigits,
      boxLocations: Set<CellID>,
      group2Locations: Set<CellID>,
      boxId: string,
      group2Id: string,
   ) {
      // boxDiff is a copy of boxLocations
      const boxDiff = new Set(boxLocations) // Box locations not in line
      const group2Diff = new Set<CellID>() // Row locations not in box

      for (const group2Location of group2Locations) {
         if (boxDiff.has(group2Location)) {
            boxDiff.delete(group2Location)
         } else {
            group2Diff.add(group2Location)
         }
      }

      // In (line and box), but not (rest of box)
      if (boxDiff.size === 0 && group2Diff.size !== 0) {
         successcount++
         colorGroup(sudoku, boxLocations, candidate)
         for (const extraCell of group2Diff) {
            _removeCandidate(candidate, extraCell)
            messages.add(`${candidate}: ${boxId} ⇒ ${group2Id}`)
         }
      }

      // In (line and box), but not (rest of line)
      if (group2Diff.size === 0 && boxDiff.size !== 0) {
         successcount++
         colorGroup(sudoku, group2Locations, candidate)
         for (const extraCell of boxDiff) {
            _removeCandidate(candidate, extraCell)
            messages.add(`${candidate}: ${group2Id} ⇒ ${boxId}`)
         }
      }
   }


   let successcount = 0
   const candidateLocations = sudoku.getCandidateLocations()
   for (const candidate of ALL_CANDIDATES) {
      // Boxes vs Rows (and) Boxes vs Columns
      for (const boxIndex of INDICES_TO_NINE) {
         const boxLocations = candidateLocations[candidate].box[boxIndex]

         for (const groupIndex of INDICES_TO_NINE) {
            const rowLocations = candidateLocations[candidate].row[groupIndex]
            const columnLocations = candidateLocations[candidate].column[groupIndex]

            if (boxLocations.size < 4 || rowLocations.size < 4) {
               _innerTwoGroupLogic(candidate, boxLocations, rowLocations, `Box ${boxIndex + 1}`, `Row ${groupIndex + 1}`)
            }

            if (boxLocations.size < 4 || columnLocations.size < 4) {
               _innerTwoGroupLogic(candidate, boxLocations, columnLocations, `Box ${boxIndex + 1}`, `Column ${groupIndex + 1}`)
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
      successcount,
      message: [...messages].join("\n")
   } as const
}
