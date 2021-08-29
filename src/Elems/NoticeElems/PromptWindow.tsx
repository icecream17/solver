
import './PromptWindow.css'
import React from 'react'
import App from '../../App'
import { PromptCallback } from '../../Types'
import Control from '../Control'

// Could also have other props (e.g. "type")
type PromptWindowProps = {
   finish: typeof App.prototype.finishNotice,

   message: string,
   defaultResponse: string,
   callback?: PromptCallback,
}

export default class PromptWindow extends React.Component<PromptWindowProps> {
   inputElement: HTMLTextAreaElement | null = null
   constructor (props: PromptWindowProps) {
      super(props)
      this.cancel = this.cancel.bind(this)
      this.submit = this.submit.bind(this)
   }

   render() {
      return (
         <div className="PromptWindow" role="alertdialog">
            <div className="PromptNotice">
               <label htmlFor="PromptMessage">
                  <p>{this.props.message}</p>
                  <textarea id="PromptMessage" ref={element => (this.inputElement = element)} defaultValue={this.props.defaultResponse} rows={9} />
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
      this.props.finish()
   }

   submit() {
      if (this.props.callback !== undefined) {
         if (this.inputElement !== null) {
            this.props.callback(this.inputElement.value.trim().normalize())
         } else {
            throw new ReferenceError("Cannot submit property `value` of `null` (aka this.inputElement)")
         }
      }
      this.props.finish()
   }
}
