
import React from 'react';
import _expect from '../../expectProps';

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
      _expect(StrategyLabel, props).toHaveProperties("name", "description")

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
