import React from "react";
import { _Callback } from "../../Types";
import Control from "../Control";

type TabProps = Readonly<{
   index: number
   focused: boolean
   selected: boolean
   title: string
   whenFocused: _Callback
   whenSelected: (index: number) => void
}>

export default class Tab extends React.Component<TabProps> {
   selfElement: HTMLButtonElement | null = null
   setSelfElement: (element: HTMLButtonElement | null) => HTMLButtonElement | null;
   constructor (props: TabProps) {
      super(props)
      this.setSelfElement = (element: HTMLButtonElement | null) => this.selfElement = element
      this.callbackIfNotSelected = this.callbackIfNotSelected.bind(this)
   }

   componentDidUpdate() {
      if (this.props.focused) {
         this.selfElement?.focus()
      }
   }

   render () {
      const className = this.props.selected ? `Tab selected` : `Tab unselected`
      return (
         <Control
            id={`Tab${this.props.index}`}
            onClick={this.callbackIfNotSelected}
            onFocus={this.props.whenFocused}
            className={className}
            role="tab"
            innerRef={this.setSelfElement}
            aria-controls={this.props.selected ? 'TabContent' : undefined}
            aria-selected={this.props.selected}
         >{this.props.title}</Control>
      )
   }

   callbackIfNotSelected () {
      if (!this.props.selected) {
         this.props.whenSelected(this.props.index)
      }
   }
}
