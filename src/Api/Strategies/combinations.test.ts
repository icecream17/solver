import { combinations } from "./pairsTriplesAndQuads"

test('Min > length', () => {
   expect(combinations([1, 2, 3], 5, 5)).toStrictEqual([])
})

test('generates all combinations', () => {
   expect(combinations([1, 2, 3, 4, 5, 6, 7], 2, 5)).toHaveLength(112)
})
