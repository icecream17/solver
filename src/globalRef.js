
import React from 'react'

const globalThis = window

if (!globalThis.hasOwnProperty('ReferenceRegistry')) {
   /*
    * The ReferenceRegistry is something that stores references globally
    * It's almost like document.getElementById
    *
    * @example
    * import { createGlobalRef } from './globalRef'
    * <div ref={createGlobalRef('special name')} />
    *
    * // Or use the callback
    * <div ref={e => globalRefCallback('special name', e)} />
    *
    * // later...
    * import { getGlobalRef } from './globalRef'
    * getGlobalRef('special name').current // <div> or null
    *
    */
   class ReferenceRegistry {
      static #References = Object.create(null);
      static createGlobalRef(name, ...args) {
         const ref = React.createRef(...args)
         ReferenceRegistry.#References[name] = ref
         return ref
      }

      static getGlobalRef(name) {
         return ReferenceRegistry.#References[name]
      }

      static hasGlobalRef(name) {
         return (name in ReferenceRegistry.#References)
      }

      static globalRefCallback(name, elementOrNull) {
         // onMount = element
         // unmount = null
         ReferenceRegistry.#References[name] ??= {}
         ReferenceRegistry.#References[name].current = elementOrNull
      }
   }

   Object.defineProperty(
      globalThis,
      'ReferenceRegistry',
      { value: ReferenceRegistry, writable: false, enumerable: false }
   )
}

export default globalThis.ReferenceRegistry

const {createGlobalRef, getGlobalRef, hasGlobalRef, globalRefCallback} = globalThis.ReferenceRegistry;
export {createGlobalRef, getGlobalRef, hasGlobalRef, globalRefCallback};
