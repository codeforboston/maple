import './App.css';
import { useState } from 'react';
import Amplify from "@aws-amplify/core";
import { DataStore } from "@aws-amplify/datastore";

import { Bill } from "./models";

import awsConfig from "./aws-exports";
Amplify.configure(awsConfig);


async function queryDatabase() {
  // setBil
}

function App() {
  const [bills, setBills] = useState([]);

  
  return (
    <div className="App">
      <header className="App-header">
      <p>Front end goes here</p>
      </header>
      
    </div>
  );
}

export default App;
