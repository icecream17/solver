// @flow

import { AlertType, IndexToNine, INDICES_TO_NINE, SudokuDigits, TwoDimensionalArray } from "../../Types";
import { convertArrayToEnglishList } from "../../utils";
import PureSudoku from "../Spaces/PureSudoku";
import Sudoku from "../Spaces/Sudoku";
import { SuccessError } from "../Types";
import { algebraic, boxAt, CellID, getIDFromIndexWithinBox, id } from "../Utils";

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

export type CellInfo = {
   position: CellID
   candidates: SudokuDigits[]
}

/**
 * Really just a conjugate
 * A conjugate is just a bunch of "cells"
 */
export type _CellInfoList = CellInfo[]

/**
 * Returns a sorted array of unique candidates in a conjugate
 */
function getCandidatesOfConjugate(conjugate: _CellInfoList) {
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
      )
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
   indexToPosition: (index: IndexToNine) => CellID,
   maxSize = 4 as 2 | 3 | 4
) {

   // Inner inner function to make things look nicer below
   function __errorHandling(conjugate: CellInfo[]) {
      const invalidGroupNames = convertArrayToEnglishList(
         conjugate.map(someCell => algebraic(someCell.position.row, someCell.position.column))
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
   }

   // 1. Filter the possible cells
   // Each possible cell must have 2 to maxSize candidates
   const possibleCells = [] as _CellInfoList

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
   const conjugates = [] as _CellInfoList[]
   for (const conjugate of combinations(possibleCells, 2, maxSize)) {
      const candidatesOfConjugate = getCandidatesOfConjugate(conjugate)

      // For example 3 cells needing 2 candidates = invalid.
      if (conjugate.length > candidatesOfConjugate.length) {
         __errorHandling(conjugate)
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
      const resultRow = findConjugatesOfGroup(sudoku.data[i], index => id(i, index), maxSize)
      const resultColumn = findConjugatesOfGroup(sudoku.getColumn(i), index => id(index, i), maxSize)
      const resultBox = findConjugatesOfGroup(sudoku.getBox(i), index => getIDFromIndexWithinBox(i, index), maxSize)

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
export function colorConjugate(sudoku: PureSudoku, conjugate: _CellInfoList, color = 'blue') {
   if (sudoku instanceof Sudoku) {
      for (const cell of conjugate) {
         const element = sudoku.cells[cell.position.row][cell.position.column]
         element?.highlight(cell.candidates, color)
      }
   }
}

function eliminateUsingConjugateGroup(
   sudoku: PureSudoku,
   conjugateGroup: _CellInfoList[][],
   toGroupIndex: (id: CellID) => IndexToNine,
   toGroup: (sudoku: PureSudoku, index: IndexToNine) => SudokuDigits[][],
   toPosition: (indexInGroup: IndexToNine, indexOfGroup: IndexToNine) => CellID,
) {

   let successcount = 0;
   for (const conjugateList of conjugateGroup) {
      if (conjugateList.length === 0) {
         continue
      }

      // First conjugate's first cell
      const groupIndex = toGroupIndex(conjugateList[0][0].position)
      const group = toGroup(sudoku, groupIndex)

      for (const conjugate of conjugateList) {
         let success = false
         const conjugateCandidates = getCandidatesOfConjugate(conjugate)

         for (const indexWithinGroup of INDICES_TO_NINE) {
            const thisPosition = toPosition(indexWithinGroup, groupIndex)
            // Make sure the cell is not in the conjugate
            if (!conjugate.find(cell => cell.position === thisPosition)) {
               // The cell now cannot have any of the candidates in the conjugate
               if (group[indexWithinGroup].find(candidate => conjugateCandidates.includes(candidate))) {
                  success = true
                  colorConjugate(sudoku, conjugate)
                  sudoku.set(thisPosition.row, thisPosition.column).to(
                     ...group[indexWithinGroup].filter(candidate => !conjugateCandidates.includes(candidate)))
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


function eliminateUsingConjugateGroups(sudoku: PureSudoku, conjugateGroups: readonly [_CellInfoList[][], _CellInfoList[][], _CellInfoList[][]]) {
   const [resultRows, resultColumns, resultBoxes] = conjugateGroups

   let successcount = 0;
   successcount += eliminateUsingConjugateGroup(
      sudoku,
      resultRows,
      (id) => id.row,
      (sudoku, rowIndex) => sudoku.data[rowIndex],
      (column, row) => id(row, column)
   )
   successcount += eliminateUsingConjugateGroup(
      sudoku,
      resultColumns,
      (id) => id.column,
      (sudoku, columnIndex) => sudoku.getColumn(columnIndex),
      (row, column) => id(row, column)
   )
   successcount += eliminateUsingConjugateGroup(
      sudoku,
      resultBoxes,
      (id) => boxAt(id.row, id.column),
      (sudoku, boxIndex) => sudoku.getBox(boxIndex),
      (indexInBox, boxIndex) => getIDFromIndexWithinBox(boxIndex, indexInBox)
   )

   return successcount
}

// Math.max(O(n^5), O(n^5))
export default function pairsTriplesAndQuads(sudoku: PureSudoku) {
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
