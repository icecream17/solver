
import React from 'react';
import StrategyItem from './StrategyItem';

/**
 * A list of strategies
 *
 * @requiredProps
 * - solver
 */
export default class StrategyList extends React.Component {
   constructor(props) {
      for (const requiredProperty of ["solver"]) {
         if (!(requiredProperty in props)) {
            throw TypeError(`StrategyList: Required property "${requiredProperty}" is missing`)
         }
      }

      super(props)
   }   

   render() {
      return (
         <ol className='StrategyList' id='StrategyList'>
            <StrategyItem
               name='Check for solved'
               description='Checks if a cell has only 1 possibility left\n[todo]'
               required='true'
               solver={this.props.solver}
            />
            <StrategyItem
               name='Update candidates'
               description='[todo]'
               solver={this.props.solver}
            />
            <StrategyItem
               name='Example strategy 1'
               description='[todo]'
               solver={this.props.solver}
            />
            <StrategyItem
               name='Another Example strategy'
               description='[todo]'
               solver={this.props.solver}
            />
         </ol>
      )
   }
}
