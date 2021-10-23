
import React from 'react';

type ExternalLinkProps = Readonly<{
   children: React.ReactNode
   className?: string
   href: string
   id?: string
}>

/**
 * An external link.
 * Since the link is external it'll open up in a new tab.
 *
 * It is required to have both the "content" and "href" props
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
            target="_blank"
            rel="noopener noreferrer"
         >
            {this.props.children}
         </a>
      )
   }
}
