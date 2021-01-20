import "../styles/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Map.css";
import { useState } from "react";
import Amplify from "@aws-amplify/core";
import { DataStore } from "@aws-amplify/datastore";

import { Bill } from "../src/models";

//import awsConfig from "./aws-exports";
//Amplify.configure(awsConfig);

async function queryDatabase() {
  // setBil
}

function MyApp({ Component, pageProps }) {
  const [bills, setBills] = useState([]);
  return <Component {...pageProps} />;
}

export default MyApp;
