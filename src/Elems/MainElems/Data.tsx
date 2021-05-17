import './Data.css'
import React from 'react'

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
export default class DataContainer extends React.Component<any, DataState> {
   constructor (props: any) {
      super(props)

      this.state = {
         value: ''
      }
   }

   render() {
      return (
         <label className="DataLabel DataContainer">
            <span className="DataLabelText">Data</span>
            <textarea
               className="Data"
               id="Data"
               placeholder="stuff will show here"
               autoComplete="off"
               value={this.state.value}
               onChange={this.handleChange.bind(this)}
            />
         </label>
      )
   }

   setValue(value: any) {
      this.setState(_state => ({ value }))
   }

   handleChange(event: React.ChangeEvent & { target: HTMLTextAreaElement }) {
      this.setState({ value: event.target.value });
   }
}
