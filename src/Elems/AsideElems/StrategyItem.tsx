
import './StrategyList.css'
import React from 'react';
import StrategyLabel, { StrategyLabelProps } from './StrategyLabel';
import StrategyToggler from './StrategyToggler';
import StrategyStatus, { StrategyStatusProps } from './StrategyStatus';
import Solver from '../../Api/Solver';

type StrategyItemProps = StrategyLabelProps & Readonly<{
   solver: Solver,
   index: number
   required?: true | 'true'
}>

type StrategyItemState = StrategyStatusProps & Readonly<{
   disabled: boolean
}>

/**
 * The strategy element
 *
 * Passes props to StrategyLabel
 *
 * @requiredProps
 * - name
 * - solver
 * - description
 * - index
 */
export default class StrategyItem extends React.Component<StrategyItemProps, StrategyItemState> {
   id: string;
   togglerId?: string;
   constructor(props: StrategyItemProps) {
      for (const requiredProperty of ["name", "solver", "description", "index"] as const) {
         if (!(requiredProperty in props)) {
            throw TypeError(`StrategyItem: Required property "${requiredProperty}" is missing`)
         }
      }

      super(props)

      this.id = 'strategy-' + this.props.name.replaceAll(' ', '-')
      if (!this.props?.required) {
         this.togglerId = 'strategy-toggler-' + this.props.name.replaceAll(' ', '-')
      }

      this.state = {
         success: null,
         successcount: null,

         disabled: false
      }
   }

   componentDidMount () {
      this.props.solver.strategyItemElements[this.props.index] = this
   }

   componentWillUnmount() {
      delete this.props.solver.strategyItemElements[this.props.index]
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
               <StrategyStatus {...this.state} />
            </li>
         )
      }

      return (
         <li className={thisClass} id={this.id}>
            <label htmlFor={this.togglerId}>
               <StrategyToggler callback={this.toggle.bind(this)} id={this.togglerId as string} />
               <StrategyLabel {...this.props} />
            </label>
            <StrategyStatus {...this.state} />
         </li>
      )
   }

   toggle(_event: React.ChangeEvent) {
      this.setState(state => ({ disabled: !state.disabled }))
   }
}
