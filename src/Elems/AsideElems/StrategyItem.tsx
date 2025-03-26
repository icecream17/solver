import './StrategyItem.css'
import React from 'react';
import StrategyLabel, { StrategyLabelProps } from './StrategyLabel';
import StrategyToggler from './StrategyToggler';
import StrategyStatus, { StrategyStatusProps } from './StrategyStatus';
import Solver from '../../Api/Solver';

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
   constructor(props: StrategyItemProps) {
      super(props)

      const name = this.props.name.replaceAll(' ', '-')
      this.id = `strategy-${name}` as const
      this.labelId = `label-for-strategy-${name}` as const

      this.state = {
         success: null,
         successcount: null,

         disabled: false,
         isCurrentStrategy: false
      }

      this.reset = this.reset.bind(this)
      this.toggle = this.toggle.bind(this)
      this.onKeyDown = this.onKeyDown.bind(this)
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
         <StrategyToggler toggle={this.toggle} checked={!this.state.disabled} ariaLabel={`Toggle ${this.props.name}`} />
      )

      // Not a listbox > option role because options cannot have descendants
      // https://github.com/w3c/aria/issues/1440
      return (
         // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- Expanding the clickable area (a hidden label is NOT recommended)
         <li className={thisClass} id={this.id} aria-labelledby={this.labelId} onClick={this.toggle} onKeyDown={this.onKeyDown}>
            <StrategyLabel id={this.labelId} {...this.props} />
            {togglerPart}
            <StrategyStatus {...this.state} ariaLabel={`Status for ${this.props.name}`} />
         </li>
      )

      // StrategyLabel goes before StrategyToggler because
      // it makes sense a11y wise to put the text first

      // And also because the site supports both ltr and rtl (hopefully)
   }

   onKeyDown(event: React.KeyboardEvent) {
      if (event.key === 'Enter' || event.key === ' ') {
         this.toggle(event)
      }
   }

   toggle(_event: React.SyntheticEvent) {
      this.setState(state => ({ disabled: !state.disabled }), () => {
         this.props.solver.disabled[this.props.index] = this.state.disabled
      })
   }

   reset() {
      this.setState({ success: null, successcount: null })
   }
}
