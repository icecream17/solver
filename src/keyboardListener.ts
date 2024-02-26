/// Listen for key presses

import EventRegistry, { Listener } from "./eventRegistry"

export const keysPressed = new Set<string>()

const listenerHandler = new EventRegistry<''>()
const EMPTY_SET = new Set<never>()

const cancel: <E extends Event>(e: E) => void = e => {
    console.log('cancel')
    for (const key of keysPressed) {
        listenerHandler.notify('', key, 'cancel', EMPTY_SET, e)
    }
}

document.body.addEventListener('keydown', e => {
    keysPressed.add(e.key)
    if (e.repeat) {
        listenerHandler.notify('', e.key, 'repeat', keysPressed, e)
    } else {
        listenerHandler.notify('', e.key, 'down', keysPressed, e)
    }
})

document.body.addEventListener('keyup', e => {
    keysPressed.delete(e.key)
    listenerHandler.notify('', e.key, 'up', keysPressed, e)
})

document.body.addEventListener('focusout', cancel)
document.body.addEventListener('contextmenu', cancel)

/** Remember to cleanup with removeListener! */
export const addListener: (f: Listener) => void = f => {
    listenerHandler.addEventListener('', f)
}

export const removeListener: (f: Listener) => boolean = f =>
    listenerHandler.removeEventListener('', f)

addListener(console.debug)
