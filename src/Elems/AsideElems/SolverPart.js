
import React from 'react'
import StrategyControls from './AsideElems/StrategyControls'
import StrategyList from './AsideElems/StrategyList'

export default class SolverPart extends React.Component {
   render() {
      return (
         <div class='SolverPart'>
            <StrategyControls />
            <fieldset className="StrategyListContainer">
               <legend>strategies</legend>
               <StrategyList />
            </fieldset>
        </div>
      )
   }
}
