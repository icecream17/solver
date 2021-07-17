import React from "react"
import { convertArrayToEnglishList, _expect } from "./utils"

test("convertArrayToEnglishList", () => {
   expect(() => convertArrayToEnglishList([])).toThrow(TypeError)
   expect(convertArrayToEnglishList([1])).toBe("1")
   expect(convertArrayToEnglishList([1, 2])).toBe("1 and 2")
   expect(convertArrayToEnglishList([1, 2, 3])).toBe("1, 2, and 3")
   expect(convertArrayToEnglishList([1, 2, 3, 4])).toBe("1, 2, 3, and 4")
   expect(convertArrayToEnglishList("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""))).toBe("A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, and Z")
})

test("_expect", () => {
   class SomeComponent extends React.Component {}

   expect(() => _expect(SomeComponent, { apple: 7 }).toHaveProperty("apple")).not.toThrow()
   expect(() => _expect(SomeComponent, { apple: 7, jump: 5 }).toHaveProperties("apple", "jump")).not.toThrow()
   expect(() => _expect(SomeComponent, { jump: 5 }).toHaveProperty("apple")).toThrow()
   expect(() => _expect(SomeComponent, { apple: 7 }).toHaveProperties("apple", "jump")).toThrow()
})
