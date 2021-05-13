
import React from 'react';

const exampleUsage = `
   Example 1:
   <ExternalLink href="https://reactjs.org" content="Learn react"/>

   Example 2:
   <ExternalLink href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" content={
      What does <code>this</code> do?
   }/>
`

type ExternalLinkProps = Readonly<{
   children?: React.ReactNode
   href: any
} & typeof React.Component.prototype.props>

/**
 * An external link.
 * Since the link is external it'll open up in a new tab.
 *
 * It is required to have both the "content" and "href" props
 *
 * @example
 * <ExternalLink href="https://reactjs.org" content="Learn react"/>
 * @example
 * <ExternalLink href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" content={
 *    What does <code>this</code> do?
 * }/>
 */
export default class ExternalLink extends React.Component {
   props!: ExternalLinkProps
   constructor (props: ExternalLinkProps) {
      for (const requiredProperty of ["children", "href"]) {
         if (!(requiredProperty in props)) {
            throw TypeError(
               `ExternalLink: Required property "${requiredProperty}" is missing\n${exampleUsage}`)
         }
      }

      super(props)
   }

   render() {
      return (
         <a
            className="App-link"
            href={this.props.href}
            target="_blank"
            rel="noopener noreferrer"
         >
            {this.props.children}
         </a>
      )
   }
}