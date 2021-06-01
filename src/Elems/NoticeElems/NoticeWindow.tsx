/**
 * IMPORTANT: This is represented by a section element
 * since it's actually directly related to the content
 *
 * But it's still... _aside_ ```<Main />```
 */

import React from 'react'
import App from '../../App';
import { NoticeInfo, NoticeType, _ReactProps } from '../../Types';
import AlertNotice from './AlertNotice';
import PromptWindow from './PromptWindow';

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

      const nextTodo = this.props.todo[0]
      switch (nextTodo.type) {
         case NoticeType.ALERT:
            return <AlertNotice message={nextTodo.message} finish={this.props.finish} />
         case NoticeType.PROMPT:
            return <PromptWindow {...nextTodo} finish={this.props.finish} />
         default:
            // @ts-expect-error Here since TypeScript is now sure that `.type` doesn't exist
            throw new TypeError(`unknown todo type: ${String(nextTodo.type)}`)
      }
   }
}
