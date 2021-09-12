
import './AlertNotice.css'
import React from 'react'
import App from '../../App'
import Control from '../Control'
import { AlertType } from '../../Types'

type AlertProps = {
   finish: typeof App.prototype.finishNotice
   message: string
   type: AlertType
}

export default class AlertNotice extends React.Component<AlertProps> {
   render () {
      const text = [...this.props.message].map((character, index) => {
         if (character === '\n') {
            return <br></br>
         } else {
            return character
         }
      })
      return (
         <div className={`AlertNotice ${this.props.type}`} role="status">
            <p>{text}</p>
            <Control className="AlertOk" onClick={this.props.finish}>Ok</Control>
         </div>
      )
   }
}
