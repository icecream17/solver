/**
 * Utility functions
 */

/**
 * This function is used to wait for the components to update
 *
 * This function simply returns `Promise<undefined>`.
 * When you await for that promise, the promise is added to the event stack:
 *
 * 1. `setState` handlers
 * 2. `Promise<undefined>`
 *
 * So by the time the promise has been awaited,
 * the components have been updated.
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
 * This only expects a `string | number`, so this won't happen anyways.
 *
 * @example
 * // "2 and undefined"
 * convertArrayToEnglishList([2, undefined])
 *
 * // "1, , and 3"
 * convertArrayToEnglishList(["1", undefined, "3"])
 */
export function convertArrayToEnglishList<T extends string | number>(array: T[]) {
   if (array.length === 0) {
      throw TypeError("Array is empty!")
   } else if (array.length === 1) {
      return String(array[0])
   } else if (array.length === 2) {
      return `${array[0]} and ${array[1]}` as const
   }

   return `${array.slice(0, -1).join(', ')}, and ${array[array.length - 1]}` as const
}
