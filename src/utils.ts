/**
 * Utility functions
 */

/**
 * @example
 * await forComponentsToUpdate()
 *
 * @description
 * Do you want to wait for your components to update? Wow, look at this!
 *
 * This function simply returns `Promise<undefined>`.
 * When you await for that promise, the promise is added to the event stack:
 *
 * 1. `setState` handlers
 * 2. `Promise<undefined>`
 *
 * So by waiting for the promise to resolve, you wait for the components to update!
 *
 * Thanks to https://stackoverflow.com/q/47019199/12174015
 * and the answer at https://stackoverflow.com/a/47022453/12174015
 *
 * @example
 * await forComponentsToUpdate()
 */
// eslint-disable-next-line @typescript-eslint/require-await
export async function forComponentsToUpdate (): Promise<undefined> {
   return undefined
}

/**
 * Stops a click from bubbling up and doing something else
 */
export function dontBubble (e: React.MouseEvent) {
   e.stopPropagation()
}

// /**
//  * Unlike the function "forComponentsToUpdate",
//  * you await for the components to stop making any updates.
//  */
// export async function forComponentsToStopUpdating () {
//    let domChanged = false

//    const domChangeHandler = new MutationObserver(() => domChanged = true)
//    const rootNode = document.documentElement
//    domChangeHandler.observe(rootNode, {
//       subtree: true,
//       childList: true,
//       attributes: true,
//       characterData: true
//    })

//    do {
//       domChanged = false
//       await forComponentsToUpdate()
//    } while (domChanged)

//    // cleanup
//    domChangeHandler.disconnect()
// }

/**
 * @example
 * // "1 apple pie"
 * convertArrayToEnglishList(["1 apple pie"])
 *
 * // "1 apple pie and 12 blueberry pies"
 * convertArrayToEnglishList(["1 apple pie", "12 blueberry pies"])
 *
 * // "1 apple pie, 12 blueberry pies, and null"
 * convertArrayToEnglishList(["1 apple pie", "12 blueberry pies", null])
 *
 * // "A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, and Z"
 * convertArrayToEnglishList("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""))
 *
 * @description
 * This function expects a `string | number`, so DON'T DO THIS!
 * Just some interesting edge cases.
 *
 * @example
 * // "2 and undefined"
 * convertArrayToEnglishList([2, undefined])
 *
 * // "1, , and 3"
 * convertArrayToEnglishList(["1", undefined, "3"])
 */
export function convertArrayToEnglishList<T extends string | number>(array: T[]) {
   switch (array.length) {
      case 0:
         throw TypeError("Array is empty!")
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
