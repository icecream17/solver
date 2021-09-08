import { AlertType, BOX_NAMES, COLUMN_NAMES, IndexToNine, INDICES_TO_NINE, ROW_NAMES, SudokuDigits, TwoDimensionalArray } from "../../Types";
import { convertArrayToEnglishList } from "../../utils";
import PureSudoku from "../Spaces/PureSudoku";
import Solver from "../Solver";
import { SuccessError } from "../Types";
import { algebraic, CellID, getIDFromIndexWithinBox, id } from "../Utils";
import { CellInfo, colorConjugate, combinations, _CellInfoList } from "./pairsTriplesAndQuads";

/**
 * Returns an array of all the cells which contain at least one of the candidates
 */
function getConjugateFromCandidates (cells: _CellInfoList, candidates: SudokuDigits[]) {
   return cells.filter(cell =>
      candidates.some(candidate => cell.candidates.includes(candidate))
   )
}


/**
 * Here, a "group" is a row, column, or box, but can be any group.
 *
 * Within that group, we're trying to find
 * n candidates which can only go in n cells.
 *
 * In Andrew Stuart's solver, this is equivalent to finding
 * hidden pairs, triples, and quads.
 *
 * See {@link hiddenPairsTriplesAndQuads}
 *
 * I think this is O(n^4)
 *
 * @param group - A group of cells. Generally a row, column, or box
 * @param indexToPosition - Takes the index of a cell within `group` and returns
 * the actual position of that cell. Used when displaying the invalid error.
 * @param maxSize - The maximum size of the conjugate. Default is 4.
 * (Not looking for conjugates of size 5 or more, since then there would be a
 * size 4 with the other cells by default. TODO better explanation)
 */
function findHiddenConjugatesOfGroup(
   group: TwoDimensionalArray<SudokuDigits>,
   indexToPosition: (index: IndexToNine) => CellID,
   maxSize = 4 as 2 | 3 | 4
) {

   function __errorHandling(candidatesOfConjugate: SudokuDigits[], conjugate: CellInfo[]) {
      const invalidCandidateString = convertArrayToEnglishList(candidatesOfConjugate)

      // To prevent errors in convertArrayToEnglishList
      if (conjugate.length === 0) {
         // A previous elimination must've caused this!
         return ` has 0 possibilities for ${invalidCandidateString}!!!\n`
      }
      const invalidGroupNames = convertArrayToEnglishList(
         conjugate.map(someCell => algebraic(someCell.position.row, someCell.position.column))
      )

      if (candidatesOfConjugate.length === 1) {
         return ` has 0 possibilities for ${invalidCandidateString}!!!`
      } else if (conjugate.length === 1) {
         return `: ${candidatesOfConjugate.length} candidates (${invalidCandidateString}) all want to be in ${invalidGroupNames} which is impossible!!!`
      } else {
         return `: ${candidatesOfConjugate.length} candidates (${invalidCandidateString}) all want to be in ${conjugate.length} cells (${invalidGroupNames}) which is impossible!!!`
      }
   }

   function removeCandidate(candidate: SudokuDigits) {
      possibleCandidates.delete(candidate)

      for (const cell of groupCopy) {
         const index = cell.indexOf(candidate)
         if (index !== -1) {
            cell.splice(index, 1)
         }
      }
   }

   // Copy the group
   const groupCopy = group.map(cell => cell.slice())

   // 1. Filter the possible candidates
   // a. Remove candidates that occur > maxSize times
   const possibleCandidates = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9] as const)
   const occurances = [] as number[]
   for (const candidate of possibleCandidates) {
      occurances[candidate] = groupCopy.filter(cell => cell.includes(candidate)).length
      if (occurances[candidate] > maxSize) {
         removeCandidate(candidate)
      }
   }

   // b. Remove candidates that are alone in a cell
   //    Also maxSize become possibleCandidates.size
   let keepGoing = true
   while (keepGoing) {
      keepGoing = false
      for (const cell of groupCopy) {
         if (cell.length === 1) {
            removeCandidate(cell[0])
            keepGoing = true
         }
      }

      for (const candidate of possibleCandidates) {
         if (occurances[candidate] > possibleCandidates.size) {
            removeCandidate(candidate)
            keepGoing = true
         }
      }
   }

   // 2. Do the regular pairsTriplesAndQuads function
   //     a. Filter out cells that have too few candidates
   //        (No limit on max candidates)
   const possibleCells = [] as _CellInfoList

   for (let index: IndexToNine = 0; index < 9; index = index + 1 as IndexToNine) {
      const candidates = groupCopy[index]

      if (1 < candidates.length) {
         possibleCells.push({
            position: indexToPosition(index),
            candidates
         })
      }
   }

   if (possibleCandidates.size < 2 || possibleCells.length < 2) {
      return []
   }

   // b. Now that the cells are filtered actually find the conjugates
   // In this case we're finding n candidates that must be in n cells

   maxSize = Math.min(maxSize, possibleCells.length, possibleCandidates.size) as 2 | 3 | 4

   const conjugates = []
   for (const candidatesOfConjugate of combinations(Array.from(possibleCandidates), 2, maxSize)) {
      const conjugate = getConjugateFromCandidates(possibleCells, candidatesOfConjugate)

      // e.g.: 3 candidates must be in 2 cells
      if (conjugate.length < candidatesOfConjugate.length) {
         return __errorHandling(candidatesOfConjugate, conjugate)
      } else if (conjugate.length === candidatesOfConjugate.length) {
         conjugates.push(conjugate)

         // Remove extra candidates - a conjugate was found!
         for (const cell of conjugate) {
            cell.candidates = cell.candidates.filter(
               candidate => candidatesOfConjugate.includes(candidate)
            )
         }
      }
   }

   return conjugates
}


function findHiddenConjugatesOfSudoku(sudoku: PureSudoku, maxSize = 4 as 2 | 3 | 4) {
   const conjugates = [] as _CellInfoList[]
   for (const i of INDICES_TO_NINE) {
      const resultRow = findHiddenConjugatesOfGroup(sudoku.data[i], index => id(i, index), maxSize)
      if (typeof resultRow === "string") {
         return `Row ${ROW_NAMES[i]}${resultRow}`
      }

      const resultColumn = findHiddenConjugatesOfGroup(sudoku.getColumn(i), index => id(index, i), maxSize)
      if (typeof resultColumn === "string") {
         return `Column ${COLUMN_NAMES[i]}${resultColumn}`
      }

      const resultBox = findHiddenConjugatesOfGroup(sudoku.getBox(i), index => getIDFromIndexWithinBox(i, index), maxSize)
      if (typeof resultBox === "string") {
         return `Box ${BOX_NAMES[i]}${resultBox}`
      }

      conjugates.push(...resultRow, ...resultColumn, ...resultBox)
   }

   return conjugates
}

/**
 * You should probably look at {@link findHiddenConjugatesOfGroup}
 *
 * Consider the following:
 *
 * ```
 * ...45..89   .234567.9   ..34567.9
 * ....5..8.   .23.5....   ..3.5....
 * 1........   .23.5...9   ..3.5...9
 * ```
 *
 * The hidden pair is `67`... but how is this detected?
 *
 * ## How to find hidden conjugates programmatically
 *
 * 1. First remove candidates that occur > 4 times\
 *    (`3` `5` and `9` are removed)
 *
 *    ```
 *    ...4...8.   .2.4.67..   ...4.67..
 *    .......8.   .2.......   .........
 *    1........   .2.......   .........
 *    ```
 *
 * 2. Remove candidates that are alone in a cell\
 *    (`2` `4` and `8` are removed)
 *
 *    ```
 *    .........   .....67..   .....67..
 *    .........   .........   .........
 *    .........   .........   .........
 *    ```
 *
 * 3. Tada!!!!! Found them! (Use naked conjugate function)
 *
 * ### Footnote about step 2:
 *
 * If that lone candidate *was* part of a hidden pair/triple/quad
 * `123......   123......   ..3......`
 *
 * then there would be a simpler hidden pair/triple/quad:
 * `12.......   12.......   .........`
 */
export default function hiddenPairsTriplesAndQuads(sudoku: PureSudoku, _solver: Solver) {
   let successcount = 0

   const result = findHiddenConjugatesOfSudoku(sudoku)
   if (typeof result === "string") {
      window._custom.alert(result, AlertType.ERROR)
      return {
         success: false,
         successcount: SuccessError
      }
   }

   for (const conjugate of result) {
      let success = false

      for (const conjugateCell of conjugate) {
         const actualCell = sudoku.data[conjugateCell.position.row][conjugateCell.position.column]

         // If different, replace
         if (actualCell.some(candidate => !conjugateCell.candidates.includes(candidate))) {
            sudoku.set(conjugateCell.position.row, conjugateCell.position.column).to(...conjugateCell.candidates)
            colorConjugate(sudoku, conjugate, 'solved')
            success = true
         }
      }

      // 1 success per conjugate
      if (success) {
         successcount++
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
