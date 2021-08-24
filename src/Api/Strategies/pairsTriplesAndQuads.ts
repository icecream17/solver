// @flow

import { AlertType, IndexToNine, INDICES_TO_NINE, SudokuDigits, TwoDimensionalArray } from "../../Types";
import { convertArrayToEnglishList } from "../../utils";
import PureSudoku from "../Spaces/PureSudoku";
import Solver from "../Solver";
import Sudoku from "../Spaces/Sudoku";
import { SuccessError } from "../Types";
import { algebraic, boxAt, getPositionFromIndexWithinBox } from "../Utils";

/**
 * Gets the unique combinations of an array
 * All elements are unmodified and assumed different
 *
 * "combinations" is in the mathematical sense:
 * if you give 7 elements, with min = 2 and max = 4,
 * you get (7 choose 2) + (7 choose 3) + (7 choose 4) elements.
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

/**
 * Really just a conjugate
 * A conjugate is just a bunch of "cells"
 */
export type _cellInfoList = Array<{
   position: [IndexToNine, IndexToNine], // ReturnType<typeof indexToPosition>
   candidates: SudokuDigits[]
}>

/**
 * Returns a sorted array of unique candidates in a conjugate
 */
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

/**
 * Here, a "group" is a row, column, or box, but can be any group.
 *
 * Within that group, we're trying to find subgroups, aka conjugates
 * where such subgroup has n cells and n candidates.
 *
 * In Andrew Stuart's solver, this is equivalent to finding
 * naked pairs, triples, and quads.
 *
 * @param group - A group of cells. Generally a row, column, or box
 * @param indexToPosition - Takes the index of a cell within `group` and returns
 * the actual position of that cell. Used when displaying the invalid error.
 * @param maxSize - The maximum size of the conjugate. Default is 4.
 * (Not looking for conjugates of size 5 or more, since then there would be a
 * size 4 with the other cells by default. TODO better explanation)
 */
function findConjugatesOfGroup(
   group: TwoDimensionalArray<SudokuDigits>,
   indexToPosition: (index: IndexToNine) => [IndexToNine, IndexToNine],
   maxSize = 4 as 2 | 3 | 4
) {


   // 1. Filter the possible cells
   // Each possible cell must have 2 to maxSize candidates
   const possibleCells = [] as _cellInfoList

   for (const index of INDICES_TO_NINE) {
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

      // For example 3 cells needing 2 candidates = invalid.
      if (conjugate.length > candidatesOfConjugate.length) {
         const invalidGroupNames = convertArrayToEnglishList(
            conjugate.map(someCell => algebraic(...someCell.position))
         )
         const invalidGroupCandidates = getCandidatesOfConjugate(conjugate)
         const invalidCandidateString = convertArrayToEnglishList(invalidGroupCandidates)

         if (conjugate.length === 1) {
            // Never happens since cells are filtered away
            window._custom.alert(`The cell ${invalidGroupNames} has 0 possibilities!`, AlertType.ERROR)
         } else if (invalidGroupCandidates.length === 1) {
            // Never happens
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
   for (const i of INDICES_TO_NINE) {
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

/**
 * Colors a conjugate, see Cell#highlight
 */
export function colorConjugate(sudoku: PureSudoku, conjugate: _cellInfoList, color='blue') {
   if (sudoku instanceof Sudoku) {
      for (const cell of conjugate) {
         const element = sudoku.cells[cell.position[0]][cell.position[1]]
         element?.highlight(cell.candidates, color)
      }
   }
}


function eliminateUsingConjugateGroups(sudoku: PureSudoku, conjugateGroups: readonly [_cellInfoList[][], _cellInfoList[][], _cellInfoList[][]]) {
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

         for (const column of INDICES_TO_NINE) {
            // Make sure the cell is not in the conjugate
            if (!conjugate.find(cell => cell.position[1] === column)) {
               // The cell now cannot have any of the candidates in the conjugate
               if (row[column].find(candidate => conjugateCandidates.includes(candidate))) {
                  success = true
                  colorConjugate(sudoku, conjugate)
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

         for (const row of INDICES_TO_NINE) {
            if (!conjugate.find(cell => cell.position[0] === row)) {
               if (column[row].find(candidate => conjugateCandidates.includes(candidate))) {
                  success = true
                  colorConjugate(sudoku, conjugate)
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

         for (const indexInBox of INDICES_TO_NINE) {
            const thisPosition = getPositionFromIndexWithinBox(boxIndex, indexInBox)
            if (!conjugate.find(cell => cell.position[0] === thisPosition[0] && cell.position[1] === thisPosition[1])) {
               if (box[indexInBox].find(candidate => conjugateCandidates.includes(candidate))) {
                  success = true
                  colorConjugate(sudoku, conjugate)
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

   return successcount
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

   const successcount = eliminateUsingConjugateGroups(sudoku, conjugateGroups)

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
