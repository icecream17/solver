/**
 * IMPORTANT: This is represented by a section element
 * since it's actually directly related to the content
 *
 * But it's still... _aside_ ```<Main />```
 */

import './Aside.css'
import React from 'react'
import StrategyControls from './AsideElems/StrategyControls'
import StrategyList from './AsideElems/StrategyList'

export default class Aside extends React.Component {
   render() {
      return (
         <section className="App-aside">
            <StrategyControls />
            <fieldset className="StrategyListContainer">
               <legend>strategies</legend>
               <StrategyList />
            </fieldset>
         </section>
      );
   }
}
