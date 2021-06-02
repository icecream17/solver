// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Better async stack traces
type PromiseConstructorParams<T> = [
    executor: (
        resolve: (value: T | PromiseLike<T>) => void,
        reject: (reason?: any) => void
    ) => void
]

const oldPromise = Promise;
window.Promise = class ConsoleErrorCatchPromise<T> extends Promise<T> {
    constructor (...args: PromiseConstructorParams<T>) {
        super(...args)
        this.catch(reason => {
           setTimeout(console.error, 0, reason)
           oldPromise.prototype.catch.apply(this, reason)
        })
    }
}

console.debug("Tests are setup")
