import React from 'react'

type DataState = Readonly<{
   value: typeof HTMLTextAreaElement.prototype.value
} & typeof React.Component.prototype.state>


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
export default class Data extends React.Component {
   state: DataState
   constructor (props: any) {
      super(props)

      this.state = {
         value: ''
      }
   }

   render() {
      return (
         <textarea
            className="Data"
            id="Data"
            placeholder="stuff will show here"
            value={this.state.value}
            onChange={this.handleChange.bind(this)}
         />
      )
   }

   setValue(value: any) {
      this.setState(_state => ({ value }))
   }

   handleChange(event: React.ChangeEvent & { target: HTMLTextAreaElement }) {
      this.setState({ value: event.target.value });
   }
}
