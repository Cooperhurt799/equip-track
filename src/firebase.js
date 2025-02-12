
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

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
let analytics = null;
if (typeof window !== 'undefined' && 'navigator' in window) {
  import('firebase/analytics').then(({ isSupported }) => {
    isSupported().then(supported => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    });
  });
}
const db = getFirestore(app);

export { db };
// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Replace with your Firebase configuration object
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);