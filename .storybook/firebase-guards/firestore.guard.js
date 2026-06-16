const firestore = require("@firebase/firestore")
const { throwBlockedFirebaseCall } = require("./common")

function block(apiName) {
  return () => {
    throwBlockedFirebaseCall(
      "firestore",
      apiName,
      "Provide mocked query results or inject mock props into the component under test."
    )
  }
}

module.exports = {
  ...firestore,
  getDoc: block("getDoc"),
  getDocs: block("getDocs"),
  onSnapshot: block("onSnapshot"),
  addDoc: block("addDoc"),
  setDoc: block("setDoc"),
  updateDoc: block("updateDoc"),
  deleteDoc: block("deleteDoc"),
  runTransaction: block("runTransaction"),
  getCountFromServer: block("getCountFromServer")
}
