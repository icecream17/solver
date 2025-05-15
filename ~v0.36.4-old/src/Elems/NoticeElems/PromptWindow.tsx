
import './PromptWindow.css'
import React from 'react'
import { PromptCallback } from '../../Types'
import Control from '../Control'

// Could also have other props (e.g. "type")
type PromptWindowProps = {
   whenFinish: () => void,

   title: string,
   message: string,
   defaultResponse: string,
   callback?: PromptCallback,
   cssCls?: string,
}

export default class PromptWindow extends React.Component<PromptWindowProps> {
   inputElement: HTMLTextAreaElement | null = null
   setInputElement: (element: HTMLTextAreaElement | null) => HTMLTextAreaElement | null
   constructor (props: PromptWindowProps) {
      super(props)
      this.cancel = this.cancel.bind(this)
      this.submit = this.submit.bind(this)
      this.setInputElement = (element: HTMLTextAreaElement | null) => this.inputElement = element
   }

   render() {
      return (
         <div className="PromptWindow" role="alertdialog" aria-labelledby="PromptHeader" aria-describedby="PromptMessage">
            <div className="PromptNotice">
               <h2 id="PromptHeader">{this.props.title}</h2>
               <label htmlFor="PromptMessageBox">
                  <p id="PromptMessage">{this.props.message}</p>
                  {/* eslint-disable-next-line jsx-a11y/no-autofocus --- https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/issues/816 */}
                  <textarea id="PromptMessageBox" autoFocus={true} ref={this.setInputElement} defaultValue={this.props.defaultResponse} rows={9} className={this.props.cssCls} />
               </label>
               <Control className="PromptCancel" onClick={this.cancel}>Cancel</Control>
               <Control className="PromptSubmit" onClick={this.submit}>Submit</Control>
            </div>
         </div>
      )
   }

   // Handlers
   /** Exits the prompt */
   cancel() {
      if (this.props.callback !== undefined) {
         this.props.callback(null)
      }
      this.props.whenFinish()
   }

   submit() {
      if (this.props.callback !== undefined) {
         if (this.inputElement !== null) {
            this.props.callback(this.inputElement.value.trim().normalize())
         } else {
            throw new ReferenceError("Cannot submit property `value` of `null` (aka this.inputElement)")
         }
      }
      this.props.whenFinish()
   }
}
