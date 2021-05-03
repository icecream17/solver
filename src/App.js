// import logo from './logo.svg'
import './App.css'
import React from 'react'

import Title from './Elems/Title'
import Version from './Elems/Version'
import Main from './Elems/Main'
import Aside from './Elems/Aside'

function App() {
   return (
      <div className="App">
         <header className="App-header">
            <Title />
            <Version />
         </header>
         <Main className="App-main" />
         <Aside className="App-aside" id="Aside" />
      </div>
   );
}

export default App
