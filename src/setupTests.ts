// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import { configure } from '@testing-library/dom';
import '@testing-library/jest-dom';

declare global {
   interface Window {
      _inTestMode?: true
   }
}

window._inTestMode = true

configure({
   getElementError(message: string | null, container) {
      const error = new Error(message ?? undefined)
      error.name = 'TestingLibraryElementError'
      return error
   }
})
