
import './StrategyList.css'
import React from 'react';
import StrategyLabel from './StrategyLabel';
import StrategyToggler from './StrategyToggler';
import StrategyStatus from './StrategyStatus';

/**
 * The strategy element
 *
 * Passes props to StrategyLabel
 *
 * @requiredProps
 * - name
 * - solver
 * - description
 */
export default class StrategyItem extends React.Component {
   constructor(props) {
      super(props)

      for (const requiredProperty of ["name", "solver", "description"]) {
         if (!(requiredProperty in props)) {
            throw TypeError(`StrategyLabel: Required property "${requiredProperty}" is missing`)
         }
      }

      this.id = 'strategy-' + this.props.name.replaceAll(' ', '-')
      if (!this.props.required) {
         this.togglerId = 'strategy-toggler-' + this.props.name.replaceAll(' ', '-')
      }
      this.state = {
         success: null,
         successcount: null,

         disabled: false
      }
   }

   render() {
      let thisClass = 'StrategyItem'
      if (this.state.disabled) {
         thisClass += ' disabled'
      }

      if (this.props.required) {
         return (
            <li className={thisClass} id={this.id}>
               <StrategyLabel {...this.props} />
               <StrategyStatus state={this.state} />
            </li>
         )
      }

      return (
         <li className={thisClass} id={this.id}>
            <label htmlFor={this.togglerId}>
               <StrategyToggler callback={this.toggle.bind(this)} id={this.togglerId} />
               <StrategyLabel {...this.props} />
            </label>
            <StrategyStatus state={this.state} />
         </li>
      )
   }

   toggle(_event) {
      this.setState(state => ({ disabled: !state.disabled }))
   }
}
