import React from 'react';

export type StrategyStatusLabelProps = Readonly<{
   name: string
   id?: string
}>

/**
 * Same as {@link StrategyLabel}, but this time labelling the {@link StrategyStatus}
 */
export default class StrategyStatusLabel extends React.PureComponent<StrategyStatusLabelProps> {
   render() {
      return (
         <span className="StrategyStatusLabel">
            {`${this.props.name} successes`}
         </span>
      )
   }
}
