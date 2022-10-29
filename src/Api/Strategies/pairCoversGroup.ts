import { SudokuDigits } from "../../Types";
import PureSudoku, { CandidateLocations } from "../Spaces/PureSudoku";
import { affects, assertGet, CellID, groupInfo, isSubarray, isSubset, setDifference, sharedInArrays, sharedInSets } from "../Utils";
import { colorGroup, highlightGroup, removeCandidateFromCells, wouldRemoveCandidateFromCells } from "../Utils.dependent";
import { wWingBase } from "./wWing";

function _checkPair(
    cellA: CellID,
    cellB: CellID,
    candidateA: SudokuDigits,
    candidateB: SudokuDigits,
    affectsCW2C: Map<CellID, CellID[]>,
    candidateLocations: CandidateLocations[],
    sudoku: PureSudoku,
) {
    const affectsA = assertGet(affectsCW2C, cellA)
    const affectsB = assertGet(affectsCW2C, cellB)
    const affectsAB = sharedInArrays(affectsA, affectsB)
    const affectsEitherAorB = new Set(affectsA.concat(affectsB))

    const type2 = new Map<string, () => Set<CellID>>()
    let success = false
    for (const prop of ["rows", "columns", "boxes"] as const) {
        for (const group of candidateLocations[candidateA][prop]) {
            // Check if all members of a group that have some candidate
            // see either A or B
            if (group.size !== 0 && isSubset(group, affectsEitherAorB)) {
                // Elimination type A
                const _groupArr = [...group]
                const [groupIndex, allOfGroup, remaining] = groupInfo(prop, _groupArr)

                // check for shared cells containing the other candidate
                if (removeCandidateFromCells(sudoku, candidateB, affectsAB)) {
                    highlightGroup(sudoku, remaining, "orange")
                    colorGroup(sudoku, [cellA, cellB], candidateA, "green")
                    colorGroup(sudoku, [cellA, cellB], candidateB)
                    success = true
                }

                // Elimination type B
                const eliminateFrom = new Set<CellID>()

                const groupA = sharedInArrays(affectsA, _groupArr)
                const groupB = sharedInArrays(affectsB, _groupArr)

                for (const aA of setDifference(affectsA, allOfGroup)) {
                    let affectsaA = affectsCW2C.get(aA)
                    if (affectsaA === undefined) {
                        affectsaA = affects(aA.row, aA.column)
                        affectsCW2C.set(aA, affectsaA)
                    }
                    if (isSubarray(groupA, affectsaA)) {
                        eliminateFrom.add(aA)
                    }
                }

                for (const aB of setDifference(affectsB, allOfGroup)) {
                    let affectsaB = affectsCW2C.get(aB)
                    if (affectsaB === undefined) {
                        affectsaB = affects(aB.row, aB.column)
                        affectsCW2C.set(aB, affectsaB)
                    }
                    if (isSubarray(groupB, affectsaB)) {
                        eliminateFrom.add(aB)
                    }
                }

                // check for shared cells containing the other candidate
                if (wouldRemoveCandidateFromCells(sudoku, candidateB, eliminateFrom)) {
                    type2.set(`${prop}${groupIndex}`, () => {
                        removeCandidateFromCells(sudoku, candidateB, eliminateFrom)
                        colorGroup(sudoku, [cellA, cellB], candidateA, "green")
                        colorGroup(sudoku, [cellA, cellB], candidateB)
                        return remaining
                    })
                }
                if (success) {
                    return [success, type2] as const
                }
            }
        }
    }
    return [false, type2] as const
}

function checkPair(
    cellA: CellID,
    cellB: CellID,
    candidateA: SudokuDigits,
    candidateB: SudokuDigits,
    affectsCW2C: Map<CellID, CellID[]>,
    candidateLocations: CandidateLocations[],
    sudoku: PureSudoku,
) {
    const result1 = _checkPair(cellA, cellB, candidateA, candidateB, affectsCW2C, candidateLocations, sudoku)
    const result2 = _checkPair(cellA, cellB, candidateB, candidateA, affectsCW2C, candidateLocations, sudoku)

    /* @ts-expect-error -- Allow booleans */ // eslint-disable-next-line @typescript-eslint/restrict-plus-operands -- Allow booleans
    const successcount = (result1[0] + result2[0]) as number
    const sharedKeys = sharedInArrays([...result1[1].keys()], [...result2[1].keys()])
    for (const key of sharedKeys) {
        const remaining1 = assertGet(result1[1], key)()
        const remaining2 = assertGet(result2[1], key)()
        highlightGroup(sudoku, sharedInSets(remaining1, remaining2), "orange")
    }

    return successcount + sharedKeys.size
}

/**
 * http://sudopedia.enjoysudoku.com/2-String_Kite.html
 * https://github.com/icecream17/solver/wiki/Pair-covers-group
 *
 * Simultaneously more general than both W-Wing and 2-string kite
 *
 * This was implemented by pure accident.
 *
 * @example
 *
 * ## Elimination A
 *
 * ```
 *             AB
 *    CC CC
 *    CC CC
 *
 * AB          xx
 * ```
 *
 * It's extended because this is also applied to other groups,
 * e.g. rows and columns
 * ```
 * xx          AB
 *    CC
 *    CC
 *
 * AB          xx
 *
 *    CC
 *    CC
 *    CC
 * ```
 *
 * Example 3
 *
 * ```
 * AB       xx xx xx
 * xx xx xx AB
 *                   CC CC CC
 * ```
 *
 * Eliminations are in all shared cells not in the group
 *
 * ## Elimination B
 *
 * If A and B are not in the C cells,
 * A abd B can be eliminated from x
 * ```
 *          |          | C  C  C
 * x  x  x  | x  x  AB |
 * x  x  AB | x  x  x  |
 * ```
 *
 * Example 2
 *
 * ```
 *  x  x  x | AB x  x  |
 *          |          | C  C
 *          |          | C  C
 * ---------+----------+----------
 *          |          |      x
 *          |          |      x
 *          |          |      AB
 * ---------+----------+----------
 *          |          |      x
 *          |          |      x
 *          |          |      x
 * ```
 */
export default function pairCoversGroup(sudoku: PureSudoku) {
    return wWingBase(sudoku, checkPair)
}
