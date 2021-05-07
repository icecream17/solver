
import './StrategyList.css'
import React from 'react';
import StrategyLabel from './StrategyLabel';
import StrategyToggler from './StrategyToggler';
import StrategyStatus from './StrategyStatus';

/**
 * The strategy element
 *
 * Passes props to StrategyLabel
 */
export default class StrategyItem extends React.Component {
   constructor(props) {
      super(props)

      for (const requiredProperty of ["name", "description"]) {
         if (!(requiredProperty in props)) {
            throw TypeError(`StrategyLabel: Required property "${requiredProperty}" is missing`)
         }
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
            <li className={thisClass} id={'strategy-' + this.props.name.replaceAll(' ', '-')}>
               <StrategyLabel name={this.props.name} description={this.props.description} />
               <StrategyStatus state={this.state} />
            </li>
         )
      }

      return (
         <li className={thisClass} id={'strategy-' + this.props.name.replaceAll(' ', '-')}>
            <label>
               <StrategyToggler callback={this.toggle.bind(this)} />
               <StrategyLabel name={this.props.name} description={this.props.description} />
            </label>
            <StrategyStatus state={this.state} />
         </li>
      )
   }

   toggle() {
      this.setState(state => ({ disabled: !state.disabled }))
   }
}
