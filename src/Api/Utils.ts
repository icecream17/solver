import { COLUMN_NAMES, IndexToNine, ROW_NAMES, SudokuDigits } from "../Types";

export function algebraic (row: IndexToNine, column: IndexToNine) {
   return (
      ROW_NAMES[row] +
      COLUMN_NAMES[column]
   ) as (
      "A1" | "A2" | "A3" | "A4" | "A5" | "A6" | "A7" | "A8" | "A9" |
      "B1" | "B2" | "B3" | "B4" | "B5" | "B6" | "B7" | "B8" | "B9" |
      "C1" | "C2" | "C3" | "C4" | "C5" | "C6" | "C7" | "C8" | "C9" |
      "D1" | "D2" | "D3" | "D4" | "D5" | "D6" | "D7" | "D8" | "D9" |
      "E1" | "E2" | "E3" | "E4" | "E5" | "E6" | "E7" | "E8" | "E9" |
      "F1" | "F2" | "F3" | "F4" | "F5" | "F6" | "F7" | "F8" | "F9" |
      "G1" | "G2" | "G3" | "G4" | "G5" | "G6" | "G7" | "G8" | "G9" |
      "H1" | "H2" | "H3" | "H4" | "H5" | "H6" | "H7" | "H8" | "H9" |
      "J1" | "J2" | "J3" | "J4" | "J5" | "J6" | "J7" | "J8" | "J9"
   )
}


export const boxRow = [0, 0, 0, 3, 3, 3, 6, 6, 6] as const
export const boxColumn = [0, 0, 0, 1, 1, 1, 2, 2, 2] as const
export function boxAt (row: IndexToNine, column: IndexToNine): IndexToNine {
   // + │ 0 1 2
   // ──┼──────
   // 0 │ 0 1 2
   // 3 │ 3 4 5
   // 6 │ 6 7 8
   return boxRow[row] + boxColumn[column] as IndexToNine
}

export function boxNameAt(row: IndexToNine, column: IndexToNine): SudokuDigits {
   return boxAt(row, column) + 1 as SudokuDigits
}
