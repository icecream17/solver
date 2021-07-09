// @flow

import React from 'react';
import { _expect } from '../../utils';
import ExternalLink from '../ExternalLink';

export type StrategyLabelProps = Readonly<{
   name: string
   href?: string
}>

type StrategyLabelState = Readonly<{
   bold: boolean // This isn't actually used
}>

/**
 * The text "labelling" or really naming, a strategy
 *
 * Really it's just the text inside the StrategyItem,
 * besides StrategyResult
 */
export default class StrategyLabel extends React.Component<StrategyLabelProps, StrategyLabelState> {
   constructor(props: StrategyLabelProps) {
      _expect(StrategyLabel, props).toHaveProperties("name")

      super(props)

      this.state = {
         bold: false
      }
   }

   render() {
      let content = <span className="StrategyLabel">{this.props.name}</span>
      if (this.props.href) {
         content = (
            <ExternalLink className="StrategyLabel" href={this.props.href}>
               {this.props.name}
            </ExternalLink>
         )
      }

      // Should I use <b> or <strong>?
      // <strong> = Strong importance
      // <b> = Draw attention to text without indicating it's more important
      if (this.state.bold) {
         return <strong>{content}</strong>
      }

      return content
   }
}
