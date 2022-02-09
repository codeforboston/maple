import { FirebaseOptions, initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"

// It's OK to check in these keys since they're bundled into the client and it
// makes it easier to contribute. 
//
// TODO: Replace with production config before v2 release. Do not check in
// production config.
const config: FirebaseOptions =  {
  apiKey: "AIzaSyDtqmwBWy-uM-ycTczU8Bt0scM7Pa7MBYo",
  authDomain: "digital-testimony-dev.firebaseapp.com",
  projectId: "digital-testimony-dev",
  storageBucket: "digital-testimony-dev.appspot.com",
  messagingSenderId: "313437920642",
  appId: "1:313437920642:web:42723233282dbcac37439b"
}; 

export const app = initializeApp(config)
export const auth = getAuth(app)