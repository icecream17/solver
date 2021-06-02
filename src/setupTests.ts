// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Better async stack traces
const oldError = Error
window.Error = function LogError (message) {
    const error = oldError(message)
    console.debug(error.stack)
    return error
} as ErrorConstructor

console.debug("Tests are setup")
