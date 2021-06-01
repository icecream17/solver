
import './AlertNotice.css'
import React from 'react'
import App from '../../App'
import Control from '../Control'

type AlertProps = {
   message: string,
   finish: typeof App.prototype.finishNotice,
}

export default class AlertNotice extends React.Component<AlertProps> {
   render () {
      return (
         <div className="AlertNotice" role="status">
            <p>{this.props.message}</p>
            <Control className="AlertOk" onClick={this.props.finish}>Ok</Control>
         </div>
      )
   }
}
