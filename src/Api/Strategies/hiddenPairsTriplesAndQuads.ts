import { AlertType, BOX_NAMES, COLUMN_NAMES, INDICES_TO_NINE, ROW_NAMES, SudokuDigits } from "../../Types";
import { convertArrayToEnglishList } from "../../utils";
import PureSudoku from "../Spaces/PureSudoku";
import { SuccessError } from "../Types";
import { algebraic, removeFromArray } from "../Utils";
import { CellInfo, colorConjugate, combinations, CellGroup } from "./pairsTriplesAndQuads";

/**
 * Returns an array of all the cells which contain at least one of the candidates
 */
function getConjugateFromCandidates (cells: CellGroup, candidates: SudokuDigits[]) {
   return cells.filter(cell =>
      candidates.some(candidate => cell.candidates.includes(candidate))
   )
}

function __errorHandling (candidatesOfConjugate: SudokuDigits[], conjugate: CellInfo[]) {
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

function __filterPossibleCandidates (group: CellGroup, maxSize: number, possibleCandidates: Set<SudokuDigits>) {

   function removeCandidate (candidate: SudokuDigits) {
      possibleCandidates.delete(candidate)

      for (const cell of group) {
         removeFromArray(candidate, cell.candidates)
      }
   }

   // a. Remove candidates that occur > maxSize times
   const occurances = [-1, 0, 0, 0, 0, 0, 0, 0, 0, 0] as const as Record<SudokuDigits, number>

   for (const cell of group) {
      for (const candidate of cell.candidates) {
         occurances[candidate]++
      }
   }

   for (const candidate of possibleCandidates) {
      if (occurances[candidate] > maxSize) {
         removeCandidate(candidate)
      } else if (occurances[candidate] === 0) {
         return `There is nowhere to put ${candidate}!` as const
      }
   }

   // b. Remove candidates that are alone in a cell
   //    maxSize is now possibleCandidates.size
   let keepGoing = true
   while (keepGoing) {
      keepGoing = false
      for (const cell of group) {
         if (cell.candidates.length === 1) {
            removeCandidate(cell.candidates[0])
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
   group: CellGroup,
   maxSize = 4 as 2 | 3 | 4
) {
   // copy cell objects and arrays before changing them
   group = group.map(cell => ({
      position: cell.position,
      candidates: cell.candidates.slice()
   }))

   // 1. Filter the possible candidates (return if error)
   const possibleCandidates = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9] as const)
   const __result = __filterPossibleCandidates(group, maxSize, possibleCandidates)
   if (typeof __result === "string") {
      return __result
   }

   //     c. Filter out cells that have too few candidates
   //        (No limit on max candidates)
   const possibleCells = group.filter(cell => 1 < cell.candidates.length)

   if (possibleCandidates.size < 2 || possibleCells.length < 2) {
      return []
   }

   // 2. Do the regular pairsTriplesAndQuads function.
   // Time to find the conjugates, this time n candidates that must be in n cells

   maxSize = Math.min(maxSize, possibleCells.length, possibleCandidates.size) as 2 | 3 | 4

   const conjugates = []
   const conjugateCands = [] // Only used in one location

   for (const candidatesOfConjugate of combinations(Array.from(possibleCandidates), 2, maxSize)) {
      const conjugate = getConjugateFromCandidates(possibleCells, candidatesOfConjugate)

      // if (candidatesOfConjugate.some(candidate => conjugate.every(cell => !cell.candidates.includes(candidate)))) {
      //    throw new TypeError(JSON.stringify([group, conjugate, candidatesOfConjugate]))
      // }

      // e.g.: 3 candidates must be in 2 cells
      if (candidatesOfConjugate.length > conjugate.length) {
         return __errorHandling(candidatesOfConjugate, conjugate)
      } else if (candidatesOfConjugate.length === conjugate.length) {
         // Filter extra candidates - a conjugate was found!
         const filteredConjugate = conjugate.map(cell => ({
            candidates: cell.candidates.filter(
               candidate => candidatesOfConjugate.includes(candidate)
            ),
            position: cell.position,
         }))

         // Check if this conjugate exactly overlaps a previous one
         // If so, error just like above
         for (const [i, prevConjugate] of conjugates.entries()) {
            if (prevConjugate.length === conjugate.length && prevConjugate.every(cell => conjugate.some(cell2 => cell.position === cell2.position))) {
               return __errorHandling([...new Set(candidatesOfConjugate.concat(conjugateCands[i]))], conjugate)
            }
         }
         conjugates.push(filteredConjugate)
         conjugateCands.push(candidatesOfConjugate)
      }
   }

   return conjugates
}


function findHiddenConjugatesOfSudoku(sudoku: PureSudoku, maxSize = 4 as 2 | 3 | 4) {
   const conjugates = [] as CellGroup[]
   const groups = sudoku.getGroups()
   for (const i of INDICES_TO_NINE) {
      const resultRow = findHiddenConjugatesOfGroup(groups[i * 3], maxSize)
      if (typeof resultRow === "string") {
         return `Row ${ROW_NAMES[i]}${resultRow}`
      }

      const resultColumn = findHiddenConjugatesOfGroup(groups[i * 3 + 1], maxSize)
      if (typeof resultColumn === "string") {
         return `Column ${COLUMN_NAMES[i]}${resultColumn}`
      }

      const resultBox = findHiddenConjugatesOfGroup(groups[i * 3 + 2], maxSize)
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
export default function hiddenPairsTriplesAndQuads(sudoku: PureSudoku) {
   let successcount = 0

   const result = findHiddenConjugatesOfSudoku(sudoku)
   if (typeof result === "string") {
      window._custom.alert(result, AlertType.ERROR)
      return {
         success: false,
         successcount: SuccessError
      } as const
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
