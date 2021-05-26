
import React from 'react';
import _expect from '../../expectProps';

export type StrategyStatusProps = Readonly<{
   success: null,
   successcount: null | number
}> | Readonly<{
   success: boolean,
   successcount: number
}>

/**
 * How did trying the strategy go?
 *
 * @requiredProps
 * - success
 * - successcount
 */
export default class StrategyStatus extends React.Component<StrategyStatusProps> {
   constructor(props: StrategyStatusProps) {
      _expect(StrategyStatus, props).toHaveProperties("success", "successcount")

      super(props)
   }

   render() {
      const resultText = (
         this.props.success === null
            ? '-'
            : this.props.success
               ? this.props.successcount === 1
                  ? 'Yes'
                  : this.props.successcount > 1
                     ? this.props.successcount
                     : 'Error!'
               : 'No'
      )

      const cssClass = (
         this.props.success === null
            ? 'null'
            : this.props.success
               ? 'success'
               : 'fail'
      )

      return (
         <span className={`StrategyResult ${cssClass} ${resultText === 'Error!' ? 'error' : ''}`}>
            {resultText}
         </span>
      )
   }
}
