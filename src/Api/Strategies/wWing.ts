import { GRP_TYPS, INDICES_TO_NINE, SudokuDigits } from "../../Types";
import PureSudoku, { CandidateLocations } from "../Spaces/PureSudoku";
import { SuccessError } from "../Types";
import { affects, assertGet, CellID, id, sharedInArrays } from "../Utils";
import { colorGroup, removeCandidateFromCells } from "../Utils.dependent";

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

    // check for a row, column, or box
    // which has two cells: an affectsA and an affectsB
    for (const prop of GRP_TYPS) {
        for (const group of candidateLocations[candidateA][prop]) {
            if (group.size === 2) {
                const cellxA = affectsA.find(cell => group.has(cell))
                const cellxB = affectsB.find(cell => group.has(cell))

                // eslint-disable-next-line sonarjs/no-collapsible-if -- line too long
                if (cellxA !== cellxB && cellxA !== undefined && cellxB !== undefined) {
                    // check for shared cells containing the other candidate
                    if (removeCandidateFromCells(sudoku, candidateB, affectsAB)) {
                        colorGroup(sudoku, [cellA, cellB, cellxA, cellxB], candidateA, "green")
                        colorGroup(sudoku, [cellA, cellB], candidateB)
                        return 1
                    }
                }
            }
        }
    }
    return 0
}

function checkPair(
    cellA: CellID,
    cellB: CellID,
    candidateA: SudokuDigits,
    candidateB: SudokuDigits,
    affectsCW2C: Map<CellID, CellID[]>,
    candidateLocations: CandidateLocations[],
    sudoku: PureSudoku,
): number | string {
    return _checkPair(cellA, cellB, candidateA, candidateB, affectsCW2C, candidateLocations, sudoku) +
        _checkPair(cellA, cellB, candidateB, candidateA, affectsCW2C, candidateLocations, sudoku)
}

/**
 * Calls {@param callback} with all pairs of cells
 * whose two candidates are equal
 *
 * NOTE: You must call another function with (candidateA, candidateB)
 * and (candidateB, candidateA)
 */
export function wWingBase (sudoku: PureSudoku, callback: typeof checkPair) {
    const found = new Map<number, CellID[]>()
    // Delay calculations
    const affectsCW2C = new Map<CellID, CellID[]>()
    let candidateLocations

    for (const row of INDICES_TO_NINE) {
        for (const column of INDICES_TO_NINE) {
            const cell = sudoku.data[row][column]
            if (cell.length === 2) {
                const numericID = cell[0] * 10 + cell[1]
                const equivs = found.get(numericID)
                const cid = id(row, column)
                affectsCW2C.set(cid, affects(row, column))
                if (equivs === undefined) {
                    found.set(numericID, [cid])
                } else {
                    candidateLocations ??= sudoku.getCandidateLocations()
                    for (const cell2 of equivs) {
                        const [candidateA, candidateB] = cell
                        const successcount =
                            callback(cid, cell2, candidateA, candidateB, affectsCW2C, candidateLocations, sudoku)
                        if (typeof successcount === "string") {
                            return {
                                success: false,
                                successcount: SuccessError,
                                message: successcount
                            }
                        } else if (successcount) {
                            return {
                                success: true,
                                successcount
                            } as const
                        }
                    }
                    equivs.push(cid)
                }
            }
        }
    }

    return {
        success: false
    } as const
}

/**
 * http://sudopedia.enjoysudoku.com/W-Wing.html
 *
 * @example
 * If the As are strongly linked (and ABs see As)
 * then A can be eliminated in the shared AB cells
 * ```
 * x  x  x  |       AB | A
 *       AB | x  x  x  | A
 * ```
 */
export default function wWing (sudoku: PureSudoku) {
    return wWingBase(sudoku, checkPair)
}
