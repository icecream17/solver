import React from 'react';
import Todo from '../../todo';
import StrategyControl from './StrategyControl'

/**
 * A bunch of strategy controls [TODO]
 */
export default class StrategyControls extends React.Component {
   render() {
      return (
         <fieldset className='StrategyControls'>
            <legend>controls (todo)</legend>
            <StrategyControl callback={new Todo.func("run")} name="run" />
            <StrategyControl callback={new Todo.func("step")} name="step" />
            <StrategyControl callback={new Todo.func("undo")} name="undo" />
         </fieldset>
      )
   }
}
