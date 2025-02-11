// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDpYCQla2yjxlZHC2h4hPJSPlhYg6y0a5M",
  authDomain: "equipment-tracker-566c5.firebaseapp.com",
  projectId: "equipment-tracker-566c5",
  storageBucket: "equipment-tracker-566c5.firebasestorage.app",
  messagingSenderId: "72142898448",
  appId: "1:72142898448:web:187702fc7a5b5bdad71195",
  measurementId: "G-L58WPXJ4J1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);