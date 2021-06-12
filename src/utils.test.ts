import { convertArrayToEnglishList } from "./utils"

test("convertArrayToEnglishList", () => {
   expect(() => convertArrayToEnglishList([])).toThrow(TypeError)
   expect(convertArrayToEnglishList([1])).toBe("1")
   expect(convertArrayToEnglishList([1, 2])).toBe("1 and 2")
   expect(convertArrayToEnglishList([1, 2, 3])).toBe("1, 2, and 3")
   expect(convertArrayToEnglishList([1, 2, 3, 4])).toBe("1, 2, 3, and 4")
})
