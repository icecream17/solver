// @flow

import React from 'react';
import { _expect } from '../../utils';

export type StrategyTogglerLabelProps = Readonly<{
   name: string
   id?: string
}>

/**
 * The text "labelling" or really naming, a strategy
 *
 * Really it's just the text inside the StrategyItem,
 * besides StrategyResult
 */
export default class StrategyTogglerLabel extends React.Component<StrategyTogglerLabelProps> {
   constructor(props: StrategyTogglerLabelProps) {
      _expect(StrategyTogglerLabel, props).toHaveProperties("name")
      super(props)
   }

   render() {
      return <span className="StrategyTogglerLabel" id={this.props.id}>{"Toggle " + this.props.name}</span>
   }
}
