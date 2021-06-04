import './Data.css'
import React from 'react'
import { _UnusedProps } from '../../Types'

type DataState = Readonly<{
   value: typeof HTMLTextAreaElement.prototype.value
}>


/**
 * Used to display info to the user
 *
 * unique, id = "Data"
 *
 * Currently used
 * - to show the updated candidates
 *
 * @param {React.TextareaHTMLAttributes<HTMLTextAreaElement>.value} [props.value] - Optional textarea value
 */
export default class DataContainer extends React.Component<_UnusedProps, DataState> {
   constructor (props: _UnusedProps) {
      super(props)

      this.state = {
         value: ''
      }

      this.handleChange = this.handleChange.bind(this)
   }

   render() {
      return (
         <label className="DataLabel DataContainer" htmlFor="Data">
            <span className="DataLabelText">Data</span>
            <textarea
               className="Data"
               id="Data"
               placeholder="stuff will show here"
               autoComplete="off"
               value={this.state.value}
               onChange={this.handleChange}
            />
         </label>
      )
   }

   setValue(value: DataState["value"]) {
      this.setState(_state => ({ value }))
   }

   handleChange(event: React.ChangeEvent & { target: HTMLTextAreaElement }) {
      this.setState({ value: event.target.value });
   }
}
