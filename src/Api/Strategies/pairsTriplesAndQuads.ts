// @flow

import { AlertType, SudokuDigits } from "../../Types";
import { convertArrayToEnglishList } from "../../utils";
import PureSudoku from "../Spaces/PureSudoku";
import Sudoku from "../Spaces/Sudoku";
import { CellGroup, SuccessError } from "../Types";
import { algebraic } from "../Utils";

/**
 * Gets the unique combinations of an array\
 * All elements are unmodified and assumed different
 *
 * "combinations" is in the mathematical sense:
 * if you give 7 elements, with min = 2 and max = 4,
 * you get (7 choose 2) + (7 choose 3) + (7 choose 4) elements.
 *
 * @example
 * combinations([1, 2, 3])
 * // [[3], [3, 2], [3, 2, 1], [3, 1], [2], [2, 1], [1]]
 *
 * @param {number} min - The minimum size of a combination
 * @param {number} max - The maximum size of a combination
 */
export function combinations<T>(array: T[], min = 1, max = array.length, currentCount = 1) {
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
 * Return a set of unique candidates in a conjugate
 */
function getCandidatesOfConjugate(conjugate: CellGroup) {
   // Array from the values of a set
   // The set is the accumulated candidates
   return conjugate.reduce(
      (accum, currentCell) => {
         for (const candidate of currentCell.candidates) {
            accum.add(candidate)
         }
         return accum
      }, new Set<SudokuDigits>()
   )
}

// Inner inner function to make things look nicer below
function __errorHandling (conjugate: CellGroup, invalidGroupCandidates: Set<SudokuDigits>) {
   const invalidGroupNames = convertArrayToEnglishList(
      conjugate.map(someCell => algebraic(someCell.position.row, someCell.position.column))
   )
   const invalidCandidateString = convertArrayToEnglishList(Array.from(invalidGroupCandidates).sort())

   if (conjugate.length === 1) {
      // Never happens since cells are filtered away
      window._custom.alert(`The cell ${invalidGroupNames} has 0 possibilities!`, AlertType.ERROR)
   } else if (invalidGroupCandidates.size === 1) {
      // Never happens
      window._custom.alert(`${invalidGroupNames}: ${conjugate.length} cells cannot share 1 candidate (${invalidCandidateString})!!!`, AlertType.ERROR)
   } else {
      window._custom.alert(`${invalidGroupNames}: ${conjugate.length} cells cannot share ${invalidGroupCandidates.size} candidates (${invalidCandidateString})!!!`, AlertType.ERROR)
   }
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
 * @param maxSize - The maximum size of the conjugate. Default is 4.
 * (Not looking for conjugates of size 5 or more, since then there would be a
 * size 4 with the other cells by default. TODO better explanation)
 */
function findConjugatesOfGroup(group: CellGroup, maxSize = 4 as 2 | 3 | 4) {
   // 1. Filter the possible cells
   // Each possible cell must have from 2 to maxSize candidates
   const possibleCells = group.filter(cell => 1 < cell.candidates.length && cell.candidates.length <= maxSize)

   // 2. Now that the cells are filtered actually find the conjugates
   const conjugates = [] as CellGroup[]
   for (const conjugate of combinations(possibleCells, 2, maxSize)) {
      const candidatesOfConjugate = getCandidatesOfConjugate(conjugate)

      // For example 3 cells needing 2 candidates = invalid.
      if (conjugate.length > candidatesOfConjugate.size) {
         __errorHandling(conjugate, candidatesOfConjugate)
         return "ERROR!!!" as const
      } else if (conjugate.length === candidatesOfConjugate.size) {
         // Found a conjugate!!!!!
         conjugates.push(conjugate)
      }
   }

   return conjugates
}


// Idea for hidden:
// For each candidate find squares

/**
 * Colors a conjugate, see Cell#highlight
 */
export function colorConjugate(sudoku: PureSudoku, conjugate: CellGroup, color = 'blue') {
   if (sudoku instanceof Sudoku) {
      for (const cell of conjugate) {
         const element = sudoku.cells[cell.position.row][cell.position.column]
         element?.highlight(cell.candidates, color)
      }
   }
}

function eliminateUsingConjugate(
   sudoku: PureSudoku,
   group: CellGroup,
   conjugate: CellGroup,
) {
   let successcount = 0
   const conjugateCandidates = getCandidatesOfConjugate(conjugate)
   const eliminatedFrom = []

   for (const cell of group) {
      // If this cell is not in the conjugate
      if (!conjugate.some(jCell => jCell.position === cell.position)) {

         // The cell now cannot have any of the candidates in the conjugate!!!
         const nonConjugateCandidates = cell.candidates.filter(candidate => !conjugateCandidates.has(candidate))
         if (cell.candidates.length !== nonConjugateCandidates.length) { // If has any...
            successcount++ // Success!
            colorConjugate(sudoku, conjugate)
            sudoku.set(cell.position.row, cell.position.column).to(...nonConjugateCandidates)
            eliminatedFrom.push(algebraic(cell.position.row, cell.position.column))
         }
      }
   }

   return [
      successcount,
      `${[...conjugateCandidates].join("")} ${conjugate.map(cell => algebraic(cell.position.row, cell.position.column))} ⇒ ${eliminatedFrom}`,
   ] as const
}

function eliminateUsingConjugates(sudoku: PureSudoku, groups: CellGroup[], conjugatesOfGroup: CellGroup[][]) {
   let successcount = 0
   const messages = []
   for (const [i, group] of groups.entries()) {
      for (const conjugate of conjugatesOfGroup[i]) {
         const [successes, message] = eliminateUsingConjugate(sudoku, group, conjugate)
         successcount += successes
         if (successes) {
            messages.push(message)
         }
      }
   }

   return [successcount, messages.join("\n")] as const
}

// Math.max(O(n^5), O(n^5))
export default function pairsTriplesAndQuads(sudoku: PureSudoku) {
   const groups = sudoku.getGroups()
   const conjugatesOfGroup = []
   for (const group of groups) {
      const conjugate = findConjugatesOfGroup(group)
      if (conjugate === "ERROR!!!") {
         return {
            success: false,
            successcount: SuccessError
         } as const
      }
      conjugatesOfGroup.push(conjugate)
   }

   const [successcount, message] = eliminateUsingConjugates(sudoku, groups, conjugatesOfGroup)

   if (successcount === 0) {
      return {
         success: false
      } as const
   }

   return {
      success: true,
      successcount,
      message,
   } as const
}
