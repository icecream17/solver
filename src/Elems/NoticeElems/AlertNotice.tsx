
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
      return (
         <div className={`AlertNotice ${this.props.type}`} role="status">
            <p>{this.props.message}</p>
            <Control className="AlertOk" onClick={this.props.finish}>Ok</Control>
         </div>
      )
   }
}
