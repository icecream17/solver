// @flow

import './StrategyItem.css'
import React from 'react';
import StrategyLabel, { StrategyLabelProps } from './StrategyLabel';
import StrategyToggler from './StrategyToggler';
import StrategyStatus, { StrategyStatusProps } from './StrategyStatus';
import Solver from '../../Api/Solver';
import StrategyTogglerLabel from './StrategyTogglerLabel';

export type StrategyItemProps = StrategyLabelProps & Readonly<{
   solver: Solver
   index: number
   required?: true | 'true'
}>

export type StrategyItemState = StrategyStatusProps & Readonly<{
   disabled: boolean
   isCurrentStrategy: boolean
}>

type StrategyResult = {
   success: boolean
   successcount: number | null
}

/**
 * The strategy element
 *
 * Passes props to StrategyLabel
 */
export default class StrategyItem extends React.Component<StrategyItemProps, StrategyItemState> {
   id: `strategy-${string}`;
   labelId: `label-for-strategy-${string}`;
   togglerId?: `strategy-toggler-${string}`;
   constructor(props: StrategyItemProps) {
      super(props)

      const name = this.props.name.replaceAll(' ', '-')
      this.id = `strategy-${name}` as const
      this.labelId = `label-for-strategy-${name}` as const
      if (this.props.required === undefined) {
         this.togglerId = `strategy-toggler-${name}` as const
      }

      this.state = {
         success: null,
         successcount: null,

         disabled: false,
         isCurrentStrategy: false
      }

      this.reset = this.reset.bind(this)
      this.toggle = this.toggle.bind(this)
      this.whenStepFinished = this.whenStepFinished.bind(this)
   }

   componentDidMount() {
      this.props.solver.eventRegistry.addEventListener('step finish', this.whenStepFinished)
      this.props.solver.eventRegistry.addEventListener('new turn', this.reset)
   }

   componentWillUnmount() {
      this.props.solver.eventRegistry.removeEventListener('step finish', this.whenStepFinished)
      this.props.solver.eventRegistry.removeEventListener('new turn', this.reset)
   }

   whenStepFinished({success, successcount}: StrategyResult, index: number) {
      if (index === this.props.index) {
         this.setState({ success, successcount, isCurrentStrategy: true })
      } else {
         this.setState({ isCurrentStrategy: false })
      }
   }

   render() {
      /**
       * a11y considerations:
       *
       * I want the checkbox to be togglable by clicking any part of the text.
       *
       * But the text itself isn't a good label;
       * A better label would be "toggle strategyName" instead of "strategyName"
       *
       * Also, "strategyName" should label the <li> rather than the checkbox
       */
      let thisClass = 'StrategyItem'
      if (this.state.disabled) {
         thisClass += ' disabled'
      }
      if (this.state.isCurrentStrategy) {
         thisClass += ' isCurrent'
      }

      const togglerPart = this.props.required ? <></> : (
         <label htmlFor={ this.togglerId as string }>
            <StrategyTogglerLabel {...this.props} />
            <StrategyToggler callback={this.toggle} id={this.togglerId as string} />
         </label>
      )

      return (
         <li className={thisClass} id={this.id} aria-labelledby={this.labelId}>
            <StrategyLabel id={this.labelId} {...this.props} />
            {togglerPart}
            <StrategyStatus {...this.state} />
         </li>
      )

      // StrategyLabel goes before StrategyToggler because
      // it makes sense a11y wise to put the text first

      // And also because the site supports both ltr and rtl (hopefully)
   }

   toggle(_event: React.ChangeEvent) {
      this.setState(state => ({ disabled: !state.disabled }), () => {
         this.props.solver.disabled[this.props.index] = this.state.disabled
      })
   }

   reset() {
      this.setState({ success: null, successcount: null })
   }
}
