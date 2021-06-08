
import { AlertType, IndexToNine, SudokuDigits, TwoDimensionalArray } from "../../Types";
import PureSudoku from "../PureSudoku";
import Solver from "../Solver";
import { SuccessError } from "../Types";
import { algebraic, boxAt, getPositionFromIndexWithinBox } from "../Utils";

type _cellInfoList = Array<{
   position: [IndexToNine, IndexToNine], // ReturnType<typeof indexToPosition>
   candidates: SudokuDigits[]
}>

function getCandidatesOfConjugate(conjugate: _cellInfoList) {
   // Array from the values of a set
   // The set is the accumulated candidates
   return Array.from(
      conjugate.reduce(
         (accum, currentCell) => {
            for (const candidate of currentCell.candidates) {
               accum.add(candidate)
            }
            return accum
         }, new Set<SudokuDigits>()
      ).values()
   ).sort()
}


// Say these are the cells
// 2378 <
// 2589
// 248
// 278 <
// 178
// 2587
// 189
// 28 <
// 378 <

// The quad is 2378
// O(n^4)
function findConjugatesOfGroup(
   group: TwoDimensionalArray<SudokuDigits>,
   indexToPosition: (index: IndexToNine) => [IndexToNine, IndexToNine],
   maxSize = 4 as 2 | 3 | 4
) {
   // O(n^2)
   // This just checks the cell's position, and assumes similarity
   function aIsSubconjugateOfB(a: _cellInfoList, b: _cellInfoList) {
      for (const cell of a) {
         if (!b.find(someCell => cell.position === someCell.position)) {
            return false
         }
      }
      return true
   }


   // 1. Filter the possible cells
   // Each possible cell must have 2-maxSize candidates
   const possibleCells = [] as _cellInfoList

   for (let index: IndexToNine = 0; index < 9; index = index + 1 as IndexToNine) {
      const candidates = group[index]

      if (1 < candidates.length && candidates.length <= maxSize) {
         possibleCells.push({
            position: indexToPosition(index),
            candidates
         })
      }
   }

   // 2. Now that the cells are filtered actually find the conjugates
   const conjugates = [] as _cellInfoList[]

   // For each cell, try to find conjugates
   CellLoop: // Just a label
   for (const cell of possibleCells) {
      // Get all valid *other* cells
      // Every candidate of the other cells must fit in this cell
      const otherCells = possibleCells.filter(someCell =>
         someCell !== cell &&
         someCell.candidates.every(candidate => cell.candidates.includes(candidate))
      )

      // Too many cells, for example 3 cells needing `1 2`, are invalid.
      if (otherCells.length > cell.candidates.length) {
         const invalidGroup = [cell, ...otherCells]
         const invalidGroupNames = invalidGroup.map(
            someCell => algebraic(...someCell.position)
         ).join(", and ")
         const invalidGroupCandidates = getCandidatesOfConjugate(invalidGroup).join(', and ')

         if (invalidGroup.length === 1) {
            window._custom.alert(`The cell ${invalidGroupNames} has 0 possibilities!`, AlertType.ERROR)
         } else if (invalidGroupCandidates.length === 1) {
            window._custom.alert(`${invalidGroupNames}: These ${invalidGroup.length} cells cannot share 1 candidate (${invalidGroupCandidates})!!!`, AlertType.ERROR)
         } else {
            window._custom.alert(`${invalidGroupNames}: These ${invalidGroup.length} cells cannot share ${invalidGroupCandidates.length} candidates (${invalidGroupCandidates})!!!`, AlertType.ERROR)
         }
         return "ERROR!!!" as const
      } else if (otherCells.length === cell.candidates.length) {
         // Found a conjugate!!!!!
         // Remove all conjugates that are a subset of this conjugate
         //    (Sets are subsets of themselves)
         // But exit it this conjugate is itself a subset (after the check)
         for (let index = 0; index < conjugates.length; index++) {
            if (aIsSubconjugateOfB(conjugates[index], otherCells)) {
               conjugates.splice(index, 1)
               index--;
            } else if (aIsSubconjugateOfB(otherCells, conjugates[index])) {
               continue CellLoop;
            }
         }

         conjugates.push(otherCells)
      }
   }

   return conjugates
}


// Idea for hidden:
// For each candidate find squares

// maxSize must not be 1, or else it would include solved cells
// O(n^5)
function findConjugatesOfSudoku(sudoku: PureSudoku, maxSize = 4 as 2 | 3 | 4) {
   const resultRows = [] as Array<Exclude<ReturnType<typeof findConjugatesOfGroup>, "ERROR!!!">>
   const resultColumns = [] as Array<Exclude<ReturnType<typeof findConjugatesOfGroup>, "ERROR!!!">>
   const resultBoxes = [] as Array<Exclude<ReturnType<typeof findConjugatesOfGroup>, "ERROR!!!">>
   for (let i: IndexToNine = 0; i < 9; i = i + 1 as IndexToNine) {
      const resultRow = findConjugatesOfGroup(sudoku.data[i], index => [index, i], maxSize)
      const resultColumn = findConjugatesOfGroup(sudoku.getColumn(i), index => [i, index], maxSize)
      const resultBox = findConjugatesOfGroup(sudoku.getBox(i), index => getPositionFromIndexWithinBox(i, index), maxSize)

      if (resultRow === "ERROR!!!" || resultColumn === "ERROR!!!" || resultBox === "ERROR!!!") {
         return "ERROR!!!"
      }
      resultRows.push(resultRow)
      resultColumns.push(resultColumn)
      resultBoxes.push(resultBox)
   }

   return [resultRows, resultColumns, resultBoxes] as const
}

// Math.max(O(n^5), O(n^5))
export default function pairsTriplesAndQuads(sudoku: PureSudoku, _solver: Solver) {
   const conjugateGroups = findConjugatesOfSudoku(sudoku)

   if (conjugateGroups === "ERROR!!!") {
      return {
         success: false,
         successcount: SuccessError
      } as const
   }

   let successcount = 0;
   console.debug(conjugateGroups)
   const [resultRows, resultColumns, resultBoxes] = conjugateGroups

   for (const conjugateList of resultRows) {
      if (conjugateList.length === 0) {
         continue
      }

      // First conjugate's first cell
      const rowIndex = conjugateList[0][0].position[0]
      const row = sudoku.data[rowIndex]

      for (const conjugate of conjugateList) {
         let success = false
         const conjugateCandidates = getCandidatesOfConjugate(conjugate)

         for (let column: IndexToNine = 0; column < 9; column = column + 1 as IndexToNine) {
            // Make sure the cell is not in the conjugate
            if (!conjugate.find(cell => cell.position[1] === column)) {
               // The cell now cannot have any of the candidates in the conjugate
               if (row[column].find(candidate => conjugateCandidates.includes(candidate))) {
                  success = true
                  sudoku.set(rowIndex, column).to(
                     ...row[column].filter(candidate => !conjugateCandidates.includes(candidate)))
               }
            }
         }

         if (success) {
            successcount++
         }
      }
   }

   // DRY code, no commenting here
   for (const conjugateList of resultColumns) {
      if (conjugateList.length === 0) {
         continue
      }

      const columnIndex = conjugateList[0][0].position[1]
      const column = sudoku.getColumn(columnIndex)

      for (const conjugate of conjugateList) {
         let success = false
         const conjugateCandidates = getCandidatesOfConjugate(conjugate)

         for (let row: IndexToNine = 0; row < 9; row = row + 1 as IndexToNine) {
            if (!conjugate.find(cell => cell.position[0] === row)) {
               if (column[row].find(candidate => conjugateCandidates.includes(candidate))) {
                  success = true
                  sudoku.set(row, columnIndex).to(
                     ...column[row].filter(candidate => !conjugateCandidates.includes(candidate)))
               }
            }
         }

         if (success) {
            successcount++
         }
      }
   }

   for (const conjugateList of resultBoxes) {
      if (conjugateList.length === 0) {
         continue
      }

      const boxIndex = boxAt(...conjugateList[0][0].position)
      const box = sudoku.getBox(boxIndex)

      for (const conjugate of conjugateList) {
         let success = false
         const conjugateCandidates = getCandidatesOfConjugate(conjugate)

         for (let indexInBox: IndexToNine = 0; indexInBox < 9; indexInBox = indexInBox + 1 as IndexToNine) {
            const thisPosition = getPositionFromIndexWithinBox(boxIndex, indexInBox)
            if (!conjugate.find(cell => cell.position[0] === thisPosition[0] && cell.position[1] === thisPosition[1])) {
               if (box[indexInBox].find(candidate => conjugateCandidates.includes(candidate))) {
                  success = true
                  sudoku.set(...thisPosition).to(
                     ...box[indexInBox].filter(candidate => !conjugateCandidates.includes(candidate)))
               }
            }
         }

         if (success) {
            successcount++
         }
      }
   }

   // End of dry code
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
