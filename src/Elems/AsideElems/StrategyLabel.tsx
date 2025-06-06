import React from 'react';
import ExternalLink from '../ExternalLink';

export type StrategyLabelProps = Readonly<{
   /** The name of the strategy, as displayed */
   name: string
   href?: string
   id?: string
}>

/**
 * The text {labelling} (naming) [for] a strategy; inside such StrategyItem.
 */
export default class StrategyLabel extends React.PureComponent<StrategyLabelProps> {
   render() {
      if (this.props.href) {
         return (
            <ExternalLink className="StrategyLabel" id={this.props.id} href={this.props.href}>
               {this.props.name}
            </ExternalLink>
         )
      }

      return <span className="StrategyLabel" id={this.props.id}>{this.props.name}</span>
   }
}
