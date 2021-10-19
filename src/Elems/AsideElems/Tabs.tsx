import React from "react";
import "./Tabs.css"

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

      this.whenTabChange = this.whenTabChange.bind(this)
   }

   render () {
      const tabs = []
      for (const [index, title] of this.props.tabNames.entries()) {
         tabs.push(
            <Tab
               key={index}
               index={index}
               selected={this.state.selectedTab === index}
               title={title}
               whenSelected={this.whenTabChange}
            />
         )
      }

      /**
       * https://www.w3.org/TR/wai-aria-practices-1.1/examples/tabs/tabs-1/tabs.html
       *
       * Using div here because it's recommended
       */
      return (
         <div className="Tabs" role="tablist">
            {tabs}
         </div>
      )
   }

   whenTabChange(index: number) {
      this.setState({selectedTab: index})
      this.props.whenTabChange(index)
   }
}
