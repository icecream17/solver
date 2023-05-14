
import './StrategyDetails.css'
import React from "react"
import Solver from "../../Api/Solver"
import { StrategyResult } from "../../Api/Types"

type StrategyDetailsProps = Readonly<{
   solver: Solver
}>

type StrategyDetailsState = Readonly<{
   text: string
}>

export default class StrategyDetails extends React.Component<StrategyDetailsProps, StrategyDetailsState> {
   constructor(props: StrategyDetailsProps) {
      super(props)

      this.state = {
         text: ""
      }

      this.reset = this.reset.bind(this)
      this.whenStepFinished = this.whenStepFinished.bind(this)
   }

   componentDidMount() {
      this.props.solver.eventRegistry.addEventListener('step finish', this.whenStepFinished)
      this.props.solver.eventRegistry.addEventListener('new turn', this.reset)
   }

   componentWillUnmount() {
      this.props.solver.eventRegistry.removeEventListener('step finish', this.whenStepFinished)
      this.props.solver.eventRegistry.removeEventListener('new turn', this.reset)
   }

   whenStepFinished({message}: StrategyResult) {
      this.setState({ text: message ?? "" })
   }

   reset() {
      this.setState({ text: "" })
   }

   render() {
      return (
         <details className="StrategyDetails" open>
            <summary>Strategy explanation</summary>
            <p>{this.state.text}</p>
         </details>
      )
   }
}
