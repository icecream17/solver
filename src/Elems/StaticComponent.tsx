import React from "react";

const alwaysEqual = () => true

export default function StaticComponent <P> (func: React.FunctionComponent<P>) {
   return React.memo(func, alwaysEqual)
}
