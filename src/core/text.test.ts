import { arraysAreEqual, convertArrayToEnglishList } from './text'

// Keep the original utility edge cases when moving src/utils.ts into the core.
test('English lists handle empty, singular, pair and longer inputs', () => {
   expect(() => convertArrayToEnglishList([])).toThrow(TypeError)
   expect(convertArrayToEnglishList([1])).toBe('1')
   expect(convertArrayToEnglishList([1, 2])).toBe('1 and 2')
   expect(convertArrayToEnglishList([1, 2, 3])).toBe('1, 2, and 3')
   expect(convertArrayToEnglishList([1, 2, 3, 4])).toBe('1, 2, 3, and 4')
   expect(convertArrayToEnglishList('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''))).toBe(
      'A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, and Z'
   )
})

test('array equality compares length, value and order without coercion', () => {
   expect(arraysAreEqual([], [2])).toBe(false)
   expect(arraysAreEqual([2], [2])).toBe(true)
   expect(arraysAreEqual([2], [2, 2])).toBe(false)
   expect(arraysAreEqual([2], ['2'])).toBe(false)
   expect(arraysAreEqual([1, 2], [2, 1])).toBe(false)
})
