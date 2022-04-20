/**
 * IMPORTANT: This is represented by a section element
 * since it's actually directly related to the content
 *
 * But it's still... _aside_ ```<Main />```
 */

import React, { lazy, Suspense } from 'react'
import { NoticeInfo, NoticeType } from '../../Types';
const AlertNotice = lazy(() => import('./AlertNotice'));
const PromptWindow = lazy(() => import('./PromptWindow'));

type NoticeProps = Readonly<{
   todo: NoticeInfo[]
   whenFinish: () => void
}>

/**
 * A general component which either renders nothing, an {@link AlertNotice},
 * or a {@link PromptWindow} based on Notice.props.todo
 *
 * Lazyloads both the AlertNotice and the PromptWindow
 */
export default class Notice extends React.Component<NoticeProps> {
   render() {
      if (this.props.todo.length === 0) {
         return <></>
      }

      const loading = <span className="loading">Loading...</span>
      const nextTodo = this.props.todo[0]
      switch (nextTodo.type) {
         case NoticeType.ALERT:
            return (
               <Suspense fallback={loading}>
                  <AlertNotice {...nextTodo} type={nextTodo.alertType} message={nextTodo.message} whenFinish={this.props.whenFinish} />
               </Suspense>
            )
         case NoticeType.PROMPT:
            return (
               <Suspense fallback={loading}>
                  <PromptWindow {...nextTodo} whenFinish={this.props.whenFinish} />
               </Suspense>
            )
         default:
            console.error(nextTodo)
            throw new TypeError(`unknown todo type`)
      }
   }
}
