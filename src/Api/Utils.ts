import { IndexToNine } from "../Types";

export function algebraic (row: IndexToNine, column: IndexToNine) {
   return "ABCDEFGHJ"[row] + "123456789"[column]
}
