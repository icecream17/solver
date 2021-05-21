import { affects } from "./Utils"

test('affects', () => {
   expect(affects(0, 0)).toContainEqual([0, 3]) // Row
   expect(affects(0, 0)).toContainEqual([3, 0]) // Column
   expect(affects(0, 0)).toContainEqual([1, 2]) // Box
   expect(affects(0, 0)).not.toContainEqual([0, 0]) // Doesn't affect itself

   for (const row of [0, 1, 2, 3, 4, 5, 6, 7, 8] as const) {
      for (const column of [0, 1, 2, 3, 4, 5, 6, 7, 8] as const) {
         // All cells affects 8 in the same row, column, and box,
         // with 4 overlaps
         expect(affects(row, column)).toHaveLength(20)
      }
   }
})
