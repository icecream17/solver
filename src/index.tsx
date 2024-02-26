import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
// import reportWebVitals from './reportWebVitals';
import deprecate from './deprecate';
import ErrorNotice from './ErrorNotice';
import { addListener as _unused_for_side_effect } from './keyboardListener';

window.alert = deprecate(window.alert, "Use window._custom.alert instead")
window.prompt = deprecate(window.prompt, "Use window._custom.prompt instead")

// Render the app
ReactDOM.render(
   <React.StrictMode>
      <ErrorNotice>
         <App />
      </ErrorNotice>
   </React.StrictMode>,
   document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

// if (process.env.NODE_ENV === 'development') {
//    reportWebVitals(console.info);
// }
