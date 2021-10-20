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

const importantKeys = ["Tab", "ArrowLeft", "ArrowRight", "Home", "End"]

export default class Tabs extends React.Component<TabsProps, TabsState> {
   tabsElement: TabsElement = null;
   tabTime = -Infinity;
   focusTime = -Infinity;
   keysPressed = new Set<string>();
   constructor (props: TabsProps) {
      super(props)
      this.state = {
         focusedTab: 0,
         selectedTab: 0,
      }

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
            ref={(element: TabsElement) => this.tabsElement = element}
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
      if (importantKeys.includes(event.code)) {
         this.keysPressed.add(event.code)
      }

      let movement: '' | 'left' | 'right' | 'Home' | 'End' = ''
      let tab = false
      for (const key of this.keysPressed) {
         if (key === 'ArrowRight') {
            if (movement === 'left') {
               movement = ''
            } else if (movement === '') {
               movement = 'right'
            }
         } else if (key === 'ArrowLeft') {
            if (movement === 'right') {
               movement = ''
            } else if (movement === '') {
               movement = 'left'
            }
         } else if (key === 'Home') {
            if (movement === 'End') {
               movement = ''
            } else {
               movement = 'Home'
            }
         } else if (key === 'End') {
            if (movement === 'Home') {
               movement = ''
            } else {
               movement = 'End'
            }
         } else if (key === 'Tab') {
            tab = true
         }
      }

      if (movement !== '') {
         this.setState((state, props) => {
            if (movement === 'left') {
               let newTab = (state.focusedTab ?? 1) - 1
               if (newTab === -1) {
                  newTab += props.tabNames.length
               }
               return { focusedTab: newTab, selectedTab: newTab }
            } else if (movement === 'right') {
               let newTab = (state.focusedTab ?? props.tabNames.length - 1) + 1
               if (newTab === props.tabNames.length) {
                  newTab = 0
               }
               return { focusedTab: newTab, selectedTab: newTab }
            } else if (movement === 'Home') {
               return { focusedTab: 0, selectedTab: 0 }
            } else if (movement === 'End') {
               return { focusedTab: props.tabNames.length - 1, selectedTab: props.tabNames.length - 1 }
            }
            throw new TypeError(`${movement} is invalid`)
         }, () => {
            this.props.whenTabChange(this.state.selectedTab)
            if (tab) {
               this.changeToMainContent()
            }
         })
      } else if (tab) {
         this.changeToMainContent()
      }
   }

   /**
    * when Tab & when Focus --> focus selected tab
    */
   whenKeyUp (event: React.KeyboardEvent) {
      this.keysPressed.delete(event.code)

      if (event.code === "Tab") {
         this.tabTime = Date.now()
         this.checkIfTabbedInto()
      }
   }

   whenTabFocused () {
      this.setState({ focusedTab: this.state.selectedTab })
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
