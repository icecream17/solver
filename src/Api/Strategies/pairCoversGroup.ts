import { BOX_NAMES, COLUMN_NAMES, ROW_NAMES, SudokuDigits } from "../../Types";
import PureSudoku, { CandidateLocations } from "../Spaces/PureSudoku";
import { affects, assertGet, CellID, groupInfo, isSubarray, isSubset, setDifference, sharedInArrays, sharedInSets } from "../Utils";
import { colorGroup, highlightGroup, removeCandidateFromCells } from "../Utils.dependent";
import { wWingBase } from "./wWing";

// TODO: Return information on what kind of success types there are
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
    const affectsAandB = sharedInArrays(affectsA, affectsB)
    const affectsEitherAorB = new Set(affectsA.concat(affectsB))

    let success = 0
    for (const prop of ["rows", "columns", "boxes"] as const) {
        for (const group_A of candidateLocations[candidateA][prop]) {
            //     ^ group [sees A or B] [has A or B]
            // Avoid eliminating everything
            if (group_A.size === 0) {
                const [groupIndex] = groupInfo(prop, [...group_A])
                switch (prop) {
                    case "rows":
                        window._custom.alert(`Row ${ROW_NAMES[groupIndex]} has no possibilities for ${candidateA} !`)
                        break
                    case "columns":
                        window._custom.alert(`Column ${COLUMN_NAMES[groupIndex]} has no possibilities for ${candidateA} !`)
                        break
                    case "boxes":
                        window._custom.alert(`Box ${BOX_NAMES[groupIndex]} has no possibilities for ${candidateA} !`)
                        break
                }
                return "error"
            }

            // Condition 2: The two cells see all cells in the group that have A.
            if (isSubset(group_A, affectsEitherAorB)) {
                // Elimination type A
                const [, allOfGroup, remaining] = groupInfo(prop, [...group_A])

                // Strategy does not work when X or Y is in the group
                if (allOfGroup.has(cellA) || allOfGroup.has(cellB)) {
                    continue
                }

                // check for shared cells containing the other candidate
                if (removeCandidateFromCells(sudoku, candidateB, affectsAandB)) {
                    highlightGroup(sudoku, remaining, "orange")
                    colorGroup(sudoku, [cellA, cellB], candidateA, "green")
                    colorGroup(sudoku, [cellA, cellB], candidateB)
                    success++
                }

                // Group + sees A or B
                // const groupA = sharedInSets(affectsA, group_A) // <
                // const groupB = sharedInSets(affectsB, group_A)

                // Group + sees A or B + has A or B
                const group_B = [...allOfGroup].filter(cell => sudoku.data[cell.row][cell.column].includes(candidateB))
                const groupAA = sharedInSets(affectsA, group_A)
                const groupAB = sharedInArrays(affectsA, group_B)
                // const groupBA = [...groupB].filter(cell => sudoku.data[cell.row][cell.column].includes(candidateA))
                // const groupBB = [...groupB].filter(cell => sudoku.data[cell.row][cell.column].includes(candidateB))

                // Affects A or B + Not in G
                const aAnG = setDifference(affectsA, allOfGroup)

                const xSeesY = affectsA.includes(cellB)
                const cond3 = isSubset(group_B, affectsEitherAorB)

                // We have
                // Z sees X, Z not in GXA (groupAA), X = A or B, Y = A or B
                //
                // Elim B0
                // Z = B --> X = A --> GX != A
                //
                // Elim B and C    (Z sees GXA) + cond 2
                // Z = A --> GXA != A --> GY = A --> Y != A
                //
                // Elim B                      cond 3
                // Z = A --> X = B --> GX != B --> GY = B --> Y != B
                //
                // Elim C          (X sees Y)
                // Z = A --> X = B --> Y = A
                if (xSeesY || cond3) {
                    for (const z of aAnG) {
                        if (z === cellA || z === cellB) {
                            continue
                        }

                        let affectsZ = affectsCW2C.get(z)
                        if (affectsZ === undefined) {
                            affectsZ = affects(z.row, z.column)
                            affectsCW2C.set(z, affectsZ)
                        }

                        if (isSubarray(groupAA, affectsZ) && removeCandidateFromCells(sudoku, candidateA, [z])) {
                            highlightGroup(sudoku, remaining, "orange")
                            colorGroup(sudoku, [cellA, cellB], candidateA, "green")
                            colorGroup(sudoku, [cellA, cellB], candidateB)
                            success++
                        }
                    }
                }

                // Elim B2       Z sees X + Z sees GXB + cond 2 + cond 3
                // Z = B --> X = A --> GX != A --> GY = A --> Y != A
                // Z = B --> GXB != B --> GY = B --> Y != B
                if (cond3) {
                    for (const z of aAnG) {
                        if (z === cellA || z === cellB) {
                            continue
                        }

                        let affectsZ = affectsCW2C.get(z)
                        if (affectsZ === undefined) {
                            affectsZ = affects(z.row, z.column)
                            affectsCW2C.set(z, affectsZ)
                        }

                        if (isSubarray(groupAB, affectsZ) && removeCandidateFromCells(sudoku, candidateB, [z])) {
                            highlightGroup(sudoku, remaining, "salmon")
                            colorGroup(sudoku, [cellA, cellB], candidateA, "green")
                            colorGroup(sudoku, [cellA, cellB], candidateB)
                            success++
                        }
                    }
                }

                if (success) {
                    return success
                }
            }
        }
    }
    return success
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
    const result3 = _checkPair(cellB, cellA, candidateA, candidateB, affectsCW2C, candidateLocations, sudoku)
    const result4 = _checkPair(cellB, cellA, candidateB, candidateA, affectsCW2C, candidateLocations, sudoku)

    if (result1 === "error" || result2 === "error" || result3 === "error" || result4 === "error") {
        return "error"
    }

    return result1 + result2 + result3 + result4
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
