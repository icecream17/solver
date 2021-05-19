
import React from 'react';
import Solver from '../../Api/Solver';
import { GuaranteedConstructCallback } from '../../Types';
import StrategyItem from './StrategyItem';

type StrategyListProps = {
   solver: Solver
} & GuaranteedConstructCallback

/**
 * A list of strategies
 *
 * @requiredProps
 * - solver
 */
export default class StrategyList extends React.Component<StrategyListProps> {
   constructor(props: StrategyListProps) {
      for (const requiredProperty of ["solver"] as const) {
         if (!(requiredProperty in props)) {
            throw TypeError(`StrategyList: Required property "${requiredProperty}" is missing`)
         }
      }

      super(props)
   }

   render() {
      let index = 0
      function getIndex () {
         return index++
      }

      return (
         <ol className='StrategyList' id='StrategyList'>
            <StrategyItem
               name='Check for solved'
               description='Checks if a cell has only 1 possibility left\n[todo]'
               required='true'
               solver={this.props.solver}
               index={getIndex()}
            />
            <StrategyItem
               name='Update candidates'
               description='[todo]'
               solver={this.props.solver}
               index={getIndex()}
            />
            <StrategyItem
               name='Example strategy 1'
               description='[todo]'
               solver={this.props.solver}
               index={getIndex()}
            />
            <StrategyItem
               name='Another Example strategy'
               description='[todo]'
               solver={this.props.solver}
               index={getIndex()}
            />
         </ol>
      )
   }
}
