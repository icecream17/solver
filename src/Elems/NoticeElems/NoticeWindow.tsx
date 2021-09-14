/**
 * IMPORTANT: This is represented by a section element
 * since it's actually directly related to the content
 *
 * But it's still... _aside_ ```<Main />```
 */

import React, { lazy, Suspense } from 'react'
import App from '../../App';
import { NoticeInfo, NoticeType, _ReactProps } from '../../Types';
const AlertNotice = lazy(() => import('./AlertNotice'));
const PromptWindow = lazy(() => import('./PromptWindow'));

type NoticeProps = Readonly<{
   todo: NoticeInfo[],
   finish: typeof App.prototype.finishNotice
}> & _ReactProps

/**
 * @requiredProps
 * - sudoku
 */
export default class Notice extends React.Component<NoticeProps> {
   render() {
      if (this.props.todo.length === 0) {
         return <></>
      }

      const loading = <span>Loading...</span>
      const nextTodo = this.props.todo[0]
      switch (nextTodo.type) {
         case NoticeType.ALERT:
            return (
               <Suspense fallback={loading}>
                  <AlertNotice type={nextTodo.alertType} message={nextTodo.message} finish={this.props.finish} />
               </Suspense>
            )
         case NoticeType.PROMPT:
            return (
               <Suspense fallback={loading}>
                  <PromptWindow {...nextTodo} finish={this.props.finish} />
               </Suspense>
            )
         default:
            console.error(nextTodo)
            // @ts-expect-error TypeScript is now sure that nextTodo can't be anything. So `.type` doesn't exist, right?
            throw new TypeError(`unknown todo type: ${String(nextTodo.type)}`)
      }
   }
}
