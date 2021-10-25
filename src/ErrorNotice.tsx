import React from "react";
import "./ErrorNotice.css";

type ErrorNoticeProps = {
   children?: React.ReactNode
}

type ErrorNoticeState = Readonly<{
   error: Error
   errorInfo: React.ErrorInfo
} | {
   error: undefined
   errorInfo: undefined
}>

export default class ErrorNotice extends React.Component<ErrorNoticeProps, ErrorNoticeState> {
   constructor (props: ErrorNoticeProps) {
      super(props)
      this.state = {
         error: undefined,
         errorInfo: undefined,
      }
   }

   render() {
      if (this.state.error) {
         return <p className="ErrorNotice">
            Something went wrong <br />
            Please post this error on github: <br />
            {this.state.error.name}: {this.state.error.message}<br />
            {this.state.errorInfo.componentStack ?? '<No stack trace>'}
         </p>
      }
      return this.props.children
   }

   componentDidCatch (error: Error, errorInfo: React.ErrorInfo) {
      console.error("App crashed", { error, errorInfo });
      this.setState({ error, errorInfo })
   }
}
