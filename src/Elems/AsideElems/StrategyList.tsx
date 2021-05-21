
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

      const getRepeatedProps = () => {
         return {
            solver: this.props.solver,
            index: getIndex()
         }
      }

      return (
         <ol className='StrategyList' id='StrategyList'>
            <StrategyItem
               name='Check for solved'
               description='Checks if a cell has only 1 possibility left\n[todo]'
               required='true'
               {...getRepeatedProps()}
            />
            <StrategyItem
               name='Update candidates'
               description='[todo]'
               {...getRepeatedProps()}
            />
            <StrategyItem
               name='Example strategy 1'
               description='[todo]'
               {...getRepeatedProps()}
            />
            <StrategyItem
               name='Another Example strategy'
               description='[todo]'
               {...getRepeatedProps()}
            />
         </ol>
      )
   }
}
