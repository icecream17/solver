import React from "react";
import { _Callback } from "../../Types";
import Control from "../Control";

type TabProps = Readonly<{
   index: number
   selected: boolean
   title: string
   whenSelected: (index: number) => void
}>

export default class Tab extends React.Component<TabProps> {
   constructor (props: TabProps) {
      super(props)
      this.callbackIfNotSelected = this.callbackIfNotSelected.bind(this)
   }

   render () {
      const className = this.props.selected ? `Tab selected` : `Tab unselected`
      return (
         <Control onClick={this.callbackIfNotSelected} className={className}>
            {this.props.title}
         </Control>
      )
   }

   callbackIfNotSelected () {
      if (!this.props.selected) {
         this.props.whenSelected(this.props.index)
      }
   }
}
