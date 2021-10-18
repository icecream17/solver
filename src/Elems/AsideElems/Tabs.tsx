import React from "react";
import { _Callback } from "../../Types";
import Tab from "./Tab";

type TabsProps = Readonly<{
   tabNames: string[]
   whenTabChange: _Callback
}>

type TabsState = Readonly<{
   selectedTab: number
}>

export default class Tabs extends React.Component<TabsProps, TabsState> {
   constructor (props: TabsProps) {
      super(props)
      this.state = {
         selectedTab: 0
      }
   }

   render () {
      let tabs = []
      for (const [index, title] of this.props.tabNames.entries()) {
         tabs.push(
            <Tab
               index={index}
               selected={this.state.selectedTab === index}
               title={title}
               whenSelected={this.props.whenTabChange}
            />
         )
      }

      return (
         <fieldset className="Tabs">
            {tabs}
         </fieldset>
      )
   }
}
