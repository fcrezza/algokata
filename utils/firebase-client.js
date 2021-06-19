import firebase from "firebase/app";
import "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAIiwCmIs3yKs9HbxNr5fH1iSSeo5LEJLU",
  authDomain: "algokata-47f89.firebaseapp.com",
  projectId: "algokata-47f89",
  storageBucket: "algokata-47f89.appspot.com",
  messagingSenderId: "420977603099",
  appId: "1:420977603099:web:c7527b51d0aca428bafebe",
  measurementId: "G-F2FVZ1KMYK"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default firebase;
