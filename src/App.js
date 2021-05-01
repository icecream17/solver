import logo from './logo.svg';
import './App.css';
import React from 'react';

class ExternalLink extends React.Component {
   render() {
      return (
         <a
            className="App-link"
            href={this.props.href}
            target="_blank"
            rel="noopener noreferrer"
         ></a>
      )
   }
}

function App() {
   return (
      <div className="App">
         <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <p>
               Edit <code>src/App.js</code> and save to reload.
            </p>
            <ExternalLink href="https://reactjs.org">
               Learn react
            </ExternalLink>
         </header>
      </div>
   );
}

export default App;
