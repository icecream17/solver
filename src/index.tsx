import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Delay popup interaction so that the user doesn't blow up
let interactionsLeft = 0
function delayInteraction(originalFunction: typeof alert): typeof alert
function delayInteraction(originalFunction: typeof prompt): typeof prompt
function delayInteraction(originalFunction: typeof confirm): typeof confirm
function delayInteraction(originalFunction: typeof alert | typeof prompt | typeof confirm): typeof originalFunction {
   return {
      [originalFunction.name](...args: Parameters<typeof originalFunction>) {
         interactionsLeft++
         if (interactionsLeft > 5) {
            throw new Error("Too much interaction!")
         }

         const result = originalFunction(...args)
         interactionsLeft--
         return result
      }
   }[originalFunction.name]
}

window.alert = delayInteraction(window.alert)
window.prompt = delayInteraction(window.prompt)
window.confirm = delayInteraction(window.confirm)


// Render the app
ReactDOM.render(
   <React.StrictMode>
      <App />
   </React.StrictMode>,
   document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.info);
