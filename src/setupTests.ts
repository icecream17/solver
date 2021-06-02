// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Better async stack traces
const oldPromise = Promise;
window.Promise = class <T> extends Promise<T> {
   constructor (...args: ConstructorParameters<typeof Promise>) {
      super(() => {}) // To appeal the compiler
      return new Promise(...args).catch(console.error) as Promise<T>
   }
}

console.debug("Tests are setup")
