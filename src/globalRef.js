
import React from 'react'

const globalThis = window

if (!globalThis.hasOwnProperty('ReferenceRegistry')) {
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
   }

   Object.defineProperty(
      globalThis,
      'ReferenceRegistry',
      { value: ReferenceRegistry, writable: false, enumerable: false }
   )
}

export default globalThis.ReferenceRegistry

const {createGlobalRef, getGlobalRef, hasGlobalRef} = globalThis.ReferenceRegistry;
export {createGlobalRef, getGlobalRef, hasGlobalRef};
