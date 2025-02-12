
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBE6V4qWocz0R0yLlexGc0cPXuPSNKVqbg",
  authDomain: "equipment-tracker-566c5.firebaseapp.com",
  projectId: "equipment-tracker-566c5",
  storageBucket: "equipment-tracker-566c5.appspot.com",
  messagingSenderId: "72142898448",
  appId: "1:72142898448:web:187702fc7a5b5bdad71195"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
