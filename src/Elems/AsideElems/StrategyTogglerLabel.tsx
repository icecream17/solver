// @flow

import React from 'react';

export type StrategyTogglerLabelProps = Readonly<{
   name: string
   id?: string
}>

/**
 * Same as {@link StrategyLabel}, but this time labelling the {@link StrategyToggler}
 */
export default class StrategyTogglerLabel extends React.PureComponent<StrategyTogglerLabelProps> {
   render() {
      return (
         <span className="StrategyTogglerLabel" id={this.props.id}>
            {`Toggle ${this.props.name}`}
         </span>
      )
   }
}
