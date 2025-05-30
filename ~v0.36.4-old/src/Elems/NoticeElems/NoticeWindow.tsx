/**
 * IMPORTANT: This is represented by a section element
 * since it's actually directly related to the content
 *
 * But it's still... _aside_ ```<Main />```
 */

import React from 'react'
import { NoticeInfo, NoticeType } from '../../Types';
import AlertNotice from './AlertNotice';
import PromptWindow from './PromptWindow';

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

      const nextTodo = this.props.todo[0]
      switch (nextTodo.type) {
         case NoticeType.ALERT:
            return <AlertNotice {...nextTodo} type={nextTodo.alertType} whenFinish={this.props.whenFinish} />
         case NoticeType.PROMPT:
            return <PromptWindow {...nextTodo} whenFinish={this.props.whenFinish} />
         default:
            console.error(nextTodo)
            throw new TypeError(`unknown todo type`)
      }
   }
}
