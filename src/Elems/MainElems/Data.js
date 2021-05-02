import React from 'react'

export default class Data extends React.Component {
   constructor (props) {
      super(props)

      this.state = {
         value: this.props.children
      }
   }

   render() {
      return (
         <textarea className="Data">{this.state.value}</textarea>
      )
   }
}
