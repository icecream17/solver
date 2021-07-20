import { IndexToNine, INDICES_TO_NINE } from "../Types"
import { affects, boxAt, getPositionFromIndexWithinBox } from "./Utils"

test('affects', () => {
   expect(affects(0, 0)).toContainEqual([0, 3]) // Row
   expect(affects(0, 0)).toContainEqual([3, 0]) // Column
   expect(affects(0, 0)).toContainEqual([1, 2]) // Box
   expect(affects(0, 0)).not.toContainEqual([0, 0]) // Doesn't affect itself

   for (const row of INDICES_TO_NINE) {
      for (const column of INDICES_TO_NINE) {
         // All cells affects 8 in the same row, column, and box,
         // with 4 overlaps
         expect(affects(row, column)).toHaveLength(20)
      }
   }
})

test.todo('boxAt')

test('box methods', () => {
   let boxCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0] as [IndexToNine, IndexToNine, IndexToNine, IndexToNine, IndexToNine, IndexToNine, IndexToNine, IndexToNine, IndexToNine]
   for (const row of INDICES_TO_NINE) {
      for (const column of INDICES_TO_NINE) {
         const indexOfBox = boxAt(row, column)
         const indexInBox = boxCounts[indexOfBox]++ as IndexToNine
         expect(getPositionFromIndexWithinBox(indexOfBox, indexInBox)).toStrictEqual([row, column])
      }
   }
})
