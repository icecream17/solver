
import './AlertNotice.css'
import React from 'react'
import Control from '../Control'
import { AlertType } from '../../Types'

type AlertProps = {
   whenFinish: () => void
   message: string
   type: AlertType
   cssCls?: string
}

export default class AlertNotice extends React.Component<AlertProps> {
   render () {
      const text = [...this.props.message].map((character, index) => (
         character === '\n'
            ? <br key={index}></br>
            : character
      ))
      return (
         <div className={`AlertNotice ${this.props.type}`} role="status">
            <p className={this.props.cssCls}>{text}</p>
            <Control className="AlertOk" onClick={this.props.whenFinish}>Ok</Control>
         </div>
      )
   }
}
