
import './PromptWindow.css'
import React from 'react'
import App from '../../App'
import { PromptCallback } from '../../Types'
import Control from '../Control'

// Could also have other props (e.g. "type")
type PromptWindowProps = {
   finish: typeof App.prototype.finishNotice,

   message: string,
   defaultResponse: string, // unused functionality - maybe expand into "any"
   callback?: PromptCallback,
}

export default class PromptWindow extends React.Component<PromptWindowProps> {
   inputElement: HTMLInputElement | null = null
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
                  <input id="PromptMessage" ref={(element) => this.inputElement = element}></input>
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
            this.props.callback(this.props.defaultResponse)
         }
      }
      this.props.finish()
   }
}
