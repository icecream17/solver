// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Better async stack traces
process.on('unhandledRejection', (reason: Error, _promise) => {
  console.log(reason)
  console.dir(reason.stack)
  throw reason
});

console.debug("Tests are setup")
