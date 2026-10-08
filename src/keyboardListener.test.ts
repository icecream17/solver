import { fireEvent } from '@testing-library/react'
import { addListener, keysPressed, removeListener } from './keyboardListener'

beforeEach(() => {
   keysPressed.clear()
})

test.each(['blur', 'contextmenu'])('cancelling on %s keeps held keys for resuming', eventType => {
   const listener = jest.fn()
   addListener(listener)

   try {
      fireEvent.keyDown(document.body, { key: 'Control' })
      fireEvent.keyDown(document.body, { key: 'ArrowRight' })
      listener.mockClear()

      if (eventType === 'blur') {
         fireEvent(window, new Event('blur'))
      } else {
         fireEvent.contextMenu(document.body)
      }

      expect(keysPressed).toStrictEqual(new Set(['Control', 'ArrowRight']))
      expect(listener).toHaveBeenCalledTimes(2)
      expect(listener).toHaveBeenCalledWith('Control', 'cancel', new Set(), expect.any(Event))
      expect(listener).toHaveBeenCalledWith('ArrowRight', 'cancel', new Set(), expect.any(Event))

      fireEvent.keyUp(document.body, { key: 'Control' })
      fireEvent.keyUp(document.body, { key: 'ArrowRight' })
      expect(keysPressed.size).toBe(0)
   } finally {
      removeListener(listener)
   }
})

test('moving focus between cells keeps held modifiers', () => {
   fireEvent.keyDown(document.body, { key: 'Control' })
   fireEvent.focusOut(document.body)
   expect(keysPressed).toStrictEqual(new Set(['Control']))
   fireEvent.keyUp(document.body, { key: 'Control' })
   expect(keysPressed.size).toBe(0)
})
