export type Listener = (...args: any[]) => void

/**
 * A class for event handling
 *
 * Remember to cleanup with removeEventListener!
 */
export default class EventRegistry<key=string> extends Map<key, Set<Listener>> {
   addEventListener<L extends Listener>(event: key, listener: L) {
      const eventListeners = this.get(event) ?? new Set()
      eventListeners.add(listener)
      this.set(event, eventListeners)
   }

   removeEventListener (event: key, listener: Listener) {
      const eventListeners = this.get(event)
      if (eventListeners === undefined) {
         return false
      }

      return eventListeners.delete(listener)
   }

   notify<T extends any[]>(event: key, ...args: T) {
      const eventListeners = this.get(event)
      if (eventListeners !== undefined) {
         for (const listener of eventListeners) {
            listener(...args)
         }
      }
   }
}
