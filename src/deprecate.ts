import { _Function } from "./Types"

const hits = new WeakSet<_Function>()

/**
 * Deprecates the function with a warning, but still keeps the original functionality
 */
export default function deprecate <T extends _Function>(func: T, message = ""): T {
   // (Of course ReturnType<T> seems to be any)
   /* eslint-disable @typescript-eslint/no-unsafe-return */
   return {
      [func.name](...args: Parameters<T>): ReturnType<T> {
         if (hits.has(func)) {
            return func(...args) as ReturnType<T>
         }

         hits.add(func)
         sendDeprecationMessage(`${func.name} is deprecated.\n${message}`)
         return func(...args) as ReturnType<T>
      }
   }[func.name] as typeof func
}

function sendDeprecationMessage(message: string) {
   console.warn(message)
}

