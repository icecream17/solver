
import React from 'react';

export type StrategyLabelProps = Readonly<{
   name: string,
   description: string
}>

type StrategyLabelState = Readonly<{
   bold: boolean
}>

/**
 * The text labelling a strategy
 */
export default class StrategyLabel extends React.Component<StrategyLabelProps, StrategyLabelState> {
   constructor(props: StrategyLabelProps) {
      for (const requiredProperty of ["name", "description"] as const) {
         if (!(requiredProperty in props)) {
            throw TypeError(`StrategyLabel: Required property "${requiredProperty}" is missing`)
         }
      }

      super(props)

      this.state = {
         bold: false
      }
   }

   render() {
      if (this.state.bold) {
         return (
            <span className="StrategyLabel">
               <span className="StrategyLabelName">
                  {this.props.name}
               </span>
               <span className="StrategyLabelTooltip">
                  <em>{this.props.description}</em>
               </span>
            </span>
         )
      }

      return (
         <span className="StrategyLabel">
            <span className="StrategyLabelName">
               {this.props.name}
            </span>
            <span className="StrategyLabelTooltip">
               {this.props.description}
            </span>
         </span>
      )
   }
}
