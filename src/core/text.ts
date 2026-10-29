/**
 * Format a nonempty list, using "and" for a pair and an Oxford comma for longer lists.
 * @example convertArrayToEnglishList([1, 2, 3]) // "1, 2, and 3"
 * @throws {TypeError} if the list is empty.
 */
export function convertArrayToEnglishList<T extends string | number>(array: T[]) {
   switch (array.length) {
      case 0:
         throw TypeError('Array is empty!')
      case 1:
         return `${array[0]}` as const
      case 2:
         return `${array[0]} and ${array[1]}` as const
      default:
         return `${array.slice(0, -1).join(', ')}, and ${array[array.length - 1]}` as const
   }
}

export function arraysAreEqual(array1: unknown[], array2: unknown[]): boolean {
   if (array1.length !== array2.length) {
      return false
   }

   return array1.every((value, index) => array2[index] === value)
}
