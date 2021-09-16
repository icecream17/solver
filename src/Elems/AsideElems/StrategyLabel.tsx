// @flow

import React from 'react';
import { _expect } from '../../utils';
import ExternalLink from '../ExternalLink';

export type StrategyLabelProps = Readonly<{
   name: string
   href?: string
   id?: string
}>

/**
 * The text "labelling" or really naming, a strategy
 *
 * Really it's just the text inside the StrategyItem,
 * besides StrategyResult
 */
export default class StrategyLabel extends React.Component<StrategyLabelProps> {
   constructor(props: StrategyLabelProps) {
      _expect(StrategyLabel, props).toHaveProperties("name")
      super(props)
   }

   render() {
      let content = <span className="StrategyLabel" id={this.props.id}>{this.props.name}</span>
      if (this.props.href) {
         content = (
            <ExternalLink className="StrategyLabel" id={this.props.id} href={this.props.href}>
               {this.props.name}
            </ExternalLink>
         )
      }

      return content
   }
}
