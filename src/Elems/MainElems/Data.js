import React from 'react'

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
   constructor (props) {
      super(props)

      this.state = {
         value: this.props.value ?? ''
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

   setValue(value) {
      this.setState(_state => ({ value }))
   }

   handleChange(event) {
      this.setState({ value: event.target.value });
   }
}
