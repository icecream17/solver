
import React from 'react';
import { dontBubble } from '../utils';

type ExternalLinkProps = Readonly<{
   children: React.ReactNode
   className?: string
   href: string
   id?: string
}>

/**
 * Opens in a new tab (external link, right?)
 *
 * @requiredProps
 * - children
 * - href
 *
 * @example
 * <ExternalLink href="https://reactjs.org" content="Learn react"/>
 * @example
 * <ExternalLink href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">
 *    What does <code>this</code> do?
 * /></ExternalLink>
 */
export default class ExternalLink extends React.PureComponent<ExternalLinkProps> {
   render() {
      let className = (this.props.className ?? "").trim()
      if (className === "") {
         className = "App-link"
      } else {
         className += " App-link"
      }

      return (
         <a
            id={this.props.id}
            className={className}
            href={this.props.href}
            onClick={dontBubble}
            target="_blank"
            rel="noopener noreferrer"
         >
            {this.props.children}
         </a>
      )
   }
}
