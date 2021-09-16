
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
   className?: string
   href?: string
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
export default class ExternalLink extends React.Component<ExternalLinkProps> {
   constructor (props: ExternalLinkProps) {
      for (const requiredProperty of ["children", "href"] as const) {
         if (!(requiredProperty in props)) {
            throw TypeError(
               `ExternalLink: Required property "${requiredProperty}" is missing\n${exampleUsage}`)
         }
      }

      super(props)
   }

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
