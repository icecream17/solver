import React from 'react';
import { SuccessError } from '../../Api/Types';

export type StrategyStatusProps = (Readonly<{
   success: null
   successcount: null | number
}> | Readonly<{
   success: boolean
   successcount: number
}>) & Readonly<{
   ariaLabel?: string
}>

/**
 * How did trying the strategy go?
 */
export default class StrategyStatus extends React.Component<StrategyStatusProps> {
   render() {
      const resultText =
         this.props.success === null
            ? ''
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

      // Don't flood notifications of updates, only soft-notify if a strategy succeeded.
      return (
         <span
            className={`StrategyResult ${cssClass} ${resultText === 'Error!' ? 'error' : ''}`}
            data-successcount={this.props.successcount}
            role="status"
            aria-label={this.props.ariaLabel}
            aria-live={this.props.success ? 'off' : undefined}>
            {resultText}
         </span>
      )
   }
}
