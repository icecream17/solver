import React from "react"

export const _expect = (component: typeof React.Component, props: typeof component.prototype.props) => {
   return {
      toHaveProperty(requiredProperty: keyof typeof props) {
         if (!(requiredProperty in props)) {
            throw TypeError(`${component.name}: Required property ${String(requiredProperty)} is missing`)
         }
      },

      toHaveProperties(...requiredProperties: Array<keyof typeof props>) {
         for (const requiredProperty of requiredProperties) {
            if (!(requiredProperty in props)) {
               throw TypeError(`${component.name}: Required property ${String(requiredProperty)} is missing`)
            }
         }
      }
   }
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function forComponentsToUpdate () {
   return undefined

   // Event stack:
   // setState()

   // Then:
   // await forComponentToUpdate

   // Event stack:
   // setState()
   // Promise(undefined)

   // Tada! Components are updated
}

/**
 * Unlike the function "forComponentsToUpdate",
 * you await for the components to stop making any updates.
 */
export async function forComponentsToStopUpdating () {
   let domChanged = false

   const domChangeHandler = new MutationObserver(() => domChanged = true)
   const rootNode = document.documentElement
   domChangeHandler.observe(rootNode, {
      subtree: true,
      childList: true,
      attributes: true,
      characterData: true
   })

   do {
      domChanged = false
      await forComponentsToUpdate()
   } while (domChanged)
}

