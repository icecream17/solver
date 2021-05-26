import React from "react"

const _expect = (component: typeof React.Component, props: typeof React.Component.prototype.props) => {
   return {
      toHaveProperty<T extends PropertyKey>(requiredProperty: T): asserts typeof props is Record<T, unknown> {
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
