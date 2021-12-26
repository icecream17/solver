import React from "react";
import "./Tabs.css"

import { _Callback } from "../../Types";
import Tab from "./Tab";

type TabsProps = Readonly<{
   tabNames: string[]
   whenTabChange: _Callback
}>

type TabsState = Readonly<{
   focusedTab: number | null
   selectedTab: number
}>

type TabsElement = HTMLDivElement | null

const importantKeys = new Set(["Tab", "ArrowLeft", "ArrowRight", "Home", "End"] as const)
const oppositeKeys = {
   ArrowLeft: "ArrowRight",
   ArrowRight: "ArrowLeft",
   Home: "End",
   End: "Home",
} as const

export default class Tabs extends React.Component<TabsProps, TabsState> {
   tabsElement: TabsElement = null;
   tabTime = -Infinity;
   focusTime = -Infinity;
   keysPressed: typeof importantKeys = new Set();
   setTabsElement: (element: TabsElement) => TabsElement;
   constructor (props: TabsProps) {
      super(props)
      this.state = {
         focusedTab: 0,
         selectedTab: 0,
      }

      this.setTabsElement = (element: TabsElement) => this.tabsElement = element

      this.whenBlur = this.whenBlur.bind(this)
      this.whenFocus = this.whenFocus.bind(this)
      this.whenKeyUp = this.whenKeyUp.bind(this)
      this.whenKeyDown = this.whenKeyDown.bind(this)
      this.whenTabChange = this.whenTabChange.bind(this)
      this.whenTabFocused = this.whenTabFocused.bind(this)
   }

   componentDidMount () {
      // @ts-expect-error Why does React have special dom types???
      document.addEventListener('keyup', this.whenKeyUp)
   }

   componentWillUnmount () {
      // @ts-expect-error Why does React have special dom types???
      document.removeEventListener('keyup', this.whenKeyUp)
   }

   render () {
      const tabs = []
      for (const [index, title] of this.props.tabNames.entries()) {
         tabs.push(
            <Tab
               key={index}
               index={index}
               focused={this.state.focusedTab === index}
               selected={this.state.selectedTab === index}
               title={title}
               whenSelected={this.whenTabChange}
               whenFocused={this.whenTabFocused}
            />
         )
      }

      /**
       * https://www.w3.org/TR/wai-aria-practices-1.1/examples/tabs/tabs-1/tabs.html
       *
       * Using div here because it's recommended
       * tabindex for focusability but not tabbability (-1)
       */
      return (
         <div
            className="Tabs"
            role="tablist"
            tabIndex={-1}
            ref={this.setTabsElement}
            onBlur={this.whenBlur}
            onFocus={this.whenFocus}
            onKeyDown={this.whenKeyDown}
            aria-owns="TabContent"
         >{tabs}</div>
      )
   }

   whenTabChange (index: number) {
      this.setState({selectedTab: index})
      this.props.whenTabChange(index)
   }

   /** Keyboard support */

   whenKeyDown (event: React.KeyboardEvent) {
      if (importantKeys.has(event.key)) { // @ts-expect-error Can't narrow
         this.keysPressed.add(event.key)
      }

      const movements = new Set<keyof typeof oppositeKeys>()
      let tab = false
      for (const key of this.keysPressed) {
         if (key === 'Tab') {
            tab = true
         } else if (movements.has(oppositeKeys[key])) {
            movements.delete(oppositeKeys[key])
         } else {
            movements.add(key)
         }
      }

      if (movements.size !== 0) {
         for (const key of ['Home', 'End', 'ArrowLeft', 'ArrowRight'] as const) {
            if (movements.has(key)) {
               this.handleMovement(key, tab)
               break
            }
         }
      } else if (tab) {
         this.changeToMainContent()
      }
   }

   private handleMovement (movement: keyof typeof oppositeKeys, tab: boolean) {
      let tabChanged = false
      this.setState((state, props) => {
         let newTab: number

         if (movement === 'End')
            newTab = props.tabNames.length - 1
         else if (movement === 'Home' || state.focusedTab === null)
            newTab = 0
         else if (movement === 'ArrowLeft')
            newTab = state.focusedTab === 0
               ? props.tabNames.length - 1
               : state.focusedTab - 1
         else if (movement === 'ArrowRight')
            newTab = state.focusedTab === props.tabNames.length - 1
               ? 0
               : state.focusedTab + 1
         else
            throw TypeError(`Impossible movement: $movement`)

         if (state.selectedTab === newTab) {
            tabChanged = true
            return { focusedTab: newTab, selectedTab: newTab }
         }

         return null
      }, () => {
         if (tabChanged) {
            this.props.whenTabChange(this.state.selectedTab)
         }
         if (tab) {
            this.changeToMainContent()
         }
      })
   }

   /**
    * when Tab & when Focus --> focus selected tab
    */
   whenKeyUp (event: React.KeyboardEvent) {
      this.keysPressed.delete(event.key)

      if (event.key === "Tab") {
         this.tabTime = Date.now()
         this.checkIfTabbedInto()
      }
   }

   whenTabFocused () {
      this.setState(prevState => ({ focusedTab: prevState.selectedTab }))
      if (this.focusTime === null) {
         this.focusTime = Date.now()
      }
   }

   whenFocus (_event: React.FocusEvent) {
      this.focusTime = Date.now()
      this.checkIfTabbedInto()
   }

   whenBlur() {
      this.focusTime = -Infinity
      this.setState({ focusedTab: null })
   }

   checkIfTabbedInto () {
      // My browser took 44ms 51ms
      if (Math.abs(this.tabTime - this.focusTime) < 300) {
         this.setState({ focusedTab: this.state.selectedTab })
      }
   }

   changeToMainContent () {
      document.getElementById('TabContent')?.focus()
   }
}
