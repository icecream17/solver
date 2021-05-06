
import React from 'react';
import StrategyItem from './StrategyItem';

/**
 * A list of strategies
 */
export default class StrategyList extends React.Component {
   render() {
      return (
         <ol className='StrategyList' id='StrategyList'>
            <StrategyItem
               name='Check for solved'
               description={
                  'Checks if a cell has only 1 possibility left\n' +
                  '[todo]'
               }
               required='true' />
            <StrategyItem
               name='Example strategy'
               description='[todo]'
            />
            <StrategyItem
               name='Example strategy 2'
               description='[todo]'
            />
            <StrategyItem
               name='Another Example strategy'
               description='[todo]'
            />
         </ol>
      )
   }
}
