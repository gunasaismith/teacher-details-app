// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCD21eOLrBrdh_Brjs8TV4K_rqQhKzQxOU",
  authDomain: "gni-results-analysis.firebaseapp.com",
  projectId: "gni-results-analysis",
  storageBucket: "gni-results-analysis.appspot.com",
  messagingSenderId: "958664799873",
  appId: "1:958664799873:web:37c66fb90fdbc423ec7f80",
  measurementId: "G-CZF7X9MEHW"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

export { db };