
import { initializeApp } from "firebase/app";
import { getFirestore, enableMultiTabIndexedDbPersistence } from "firebase/firestore";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDpYCQla2yjxlZHC2h4hPJSPlhYg6y0a5M",
  authDomain: "equipment-tracker-566c5.firebaseapp.com",
  projectId: "equipment-tracker-566c5",
  storageBucket: "equipment-tracker-566c5.firebasestorage.app",
  messagingSenderId: "72142898448",
  appId: "1:72142898448:web:187702fc7a5b5bdad71195"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

try {
  enableMultiTabIndexedDbPersistence(db);
} catch (err) {
  console.warn('Firebase persistence failed to enable:', err.code);
}

// Set auth persistence to local
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn('Auth persistence failed to set:', err.message);
});

export { db, auth };
