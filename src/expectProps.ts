import React from "react"

const _expect = (component: typeof React.Component, props: typeof React.Component.prototype.props) => {
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

export default _expect
