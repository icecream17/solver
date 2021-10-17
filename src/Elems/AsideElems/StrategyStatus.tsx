// @flow

import React from 'react';
import { SuccessError } from '../../Api/Types';

export type StrategyStatusProps = Readonly<{
   success: null
   successcount: null | number
}> | Readonly<{
   success: boolean
   successcount: number
}>

/**
 * How did trying the strategy go?
 */
export default class StrategyStatus extends React.Component<StrategyStatusProps> {
   render() {
      const resultText =
         this.props.success === null
            ? '-'
            : this.props.success
               ? this.props.successcount === 1
                  ? 'Yes'
                  : this.props.successcount
               : this.props.successcount === SuccessError
                  ? 'Error!'
                  : 'No';

      const cssClass =
         this.props.success === null
            ? 'null'
            : this.props.success
               ? 'success'
               : 'fail';

      return (
         <span
            className={`StrategyResult ${cssClass} ${resultText === 'Error!' ? 'error' : ''}`}
            data-successcount={this.props.successcount}>
            {resultText}
         </span>
      )
   }
}
