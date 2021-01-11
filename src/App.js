import './App.css';
import React from 'react';
import Amplify from "@aws-amplify/core";
import { DataStore } from "@aws-amplify/datastore";

import { Bill } from "./models";

import awsConfig from "./aws-exports";
Amplify.configure(awsConfig);

class Page extends React.Component {
  constructor(props) {
    super(props);
    queryDatabase().then(x => console.log(x));
    this.state = {
      queryResults: []
    };
  }

  render() {
    return (
      <div>
        <p>Page script</p>
      </div>
    )
  }
}

async function queryDatabase() {
  return await DataStore.query(Bill);
}

function App() {
  
  return (
    <div className="App">
      <header className="App-header">
        <Page/>
      </header>
    </div>
  );
}

export default App;
