
import { AlertType, IndexToNine, SudokuDigits, TwoDimensionalArray } from "../../Types";
import { convertArrayToEnglishList } from "../../utils";
import PureSudoku from "../PureSudoku";
import Solver from "../Solver";
import { SuccessError } from "../Types";
import { algebraic, boxAt, getPositionFromIndexWithinBox } from "../Utils";

/**
 * Gets the unique combinations of an array
 *
 * @param {number} min - The minimum size of a combination
 * @param {number} max - The maximum size of a combination
 */
export function combinations<T>(array: T[], min: number, max: number, currentCount = 1) {
   const _combinations: T[][] = []
   const _arrayCopy = array.slice()
   while (_arrayCopy.length) {
      const element = _arrayCopy.pop() as T

      // For combinations shorter than max size, but also includes max size
      if (currentCount >= min) {
         _combinations.push([element])
      }

      // After the check
      if (currentCount === max) {
         continue
      }

      for (const combination of combinations(_arrayCopy, min, max, currentCount + 1)) {
         _combinations.push([element, ...combination])
      }
   }

   return _combinations
}


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
// 2468
// 278 <
// 178
// 2467
// 189
// 28 <
// 378 <

// The quad is 2378
// O(n^3)
function findConjugatesOfGroup(
   group: TwoDimensionalArray<SudokuDigits>,
   indexToPosition: (index: IndexToNine) => [IndexToNine, IndexToNine],
   maxSize = 4 as 2 | 3 | 4
) {


   // 1. Filter the possible cells
   // Each possible cell must have 2 to maxSize candidates
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
   for (const conjugate of combinations(possibleCells, 2, maxSize)) {
      const candidatesOfConjugate = getCandidatesOfConjugate(conjugate)

      // Too many cells, for example 3 cells needing `1 2`, are invalid.
      // Add 1 to include this cell
      if (conjugate.length > candidatesOfConjugate.length) {
         const invalidGroupNames = convertArrayToEnglishList(
            conjugate.map(someCell => algebraic(...someCell.position))
         )
         const invalidGroupCandidates = getCandidatesOfConjugate(conjugate)
         const invalidCandidateString = convertArrayToEnglishList(invalidGroupCandidates)

         if (conjugate.length === 1) {
            window._custom.alert(`The cell ${invalidGroupNames} has 0 possibilities!`, AlertType.ERROR)
         } else if (invalidGroupCandidates.length === 1) {
            window._custom.alert(`${invalidGroupNames}: ${conjugate.length} cells cannot share 1 candidate (${invalidCandidateString})!!!`, AlertType.ERROR)
         } else {
            window._custom.alert(`${invalidGroupNames}: ${conjugate.length} cells cannot share ${invalidGroupCandidates.length} candidates (${invalidCandidateString})!!!`, AlertType.ERROR)
         }
         return "ERROR!!!" as const
      } else if (conjugate.length === candidatesOfConjugate.length) {
         // Found a conjugate!!!!!
         conjugates.push(conjugate)
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
      const resultRow = findConjugatesOfGroup(sudoku.data[i], index => [i, index], maxSize)
      const resultColumn = findConjugatesOfGroup(sudoku.getColumn(i), index => [index, i], maxSize)
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
