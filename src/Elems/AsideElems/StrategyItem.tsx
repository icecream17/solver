// @flow

import './StrategyItem.css'
import React from 'react';
import StrategyLabel, { StrategyLabelProps } from './StrategyLabel';
import StrategyToggler from './StrategyToggler';
import StrategyStatus, { StrategyStatusProps } from './StrategyStatus';
import Solver from '../../Api/Solver';
import { _expect } from '../../utils';

export type StrategyItemProps = StrategyLabelProps & Readonly<{
   solver: Solver,
   index: number
   required?: true | 'true'
}>

export type StrategyItemState = StrategyStatusProps & Readonly<{
   disabled: boolean,
   isCurrentStrategy: boolean
}>

/**
 * The strategy element
 *
 * Passes props to StrategyLabel
 *
 * @requiredProps
 * - name
 * - solver
 * - index
 *
 * @optionalProps
 * - href
 * - required
 */
export default class StrategyItem extends React.Component<StrategyItemProps, StrategyItemState> {
   id: string;
   togglerId?: string;
   constructor(props: StrategyItemProps) {
      _expect(StrategyItem, props).toHaveProperties("name", "solver", "index")

      super(props)

      this.id = 'strategy-' + this.props.name.replaceAll(' ', '-')
      if (this.props.required === undefined) {
         this.togglerId = 'strategy-toggler-' + this.props.name.replaceAll(' ', '-')
      }

      this.state = {
         success: null,
         successcount: null,

         disabled: false,
         isCurrentStrategy: false
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
      if (this.state.isCurrentStrategy) {
         thisClass += ' isCurrent'
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
            {/* eslint-disable-next-line jsx-a11y/label-has-for */}
            <label htmlFor={this.togglerId as string}>
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
