
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAoN4CK7zQrKbV0vQbEwlAEQCxnVcFKhzE",
  authDomain: "equipment-tracker-566c5.firebaseapp.com",
  projectId: "equipment-tracker-566c5",
  storageBucket: "equipment-tracker-566c5.appspot.com",
  messagingSenderId: "1093661141864",
  appId: "1:1093661141864:web:5a36f91e5b5d08e1c3483f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { db, auth };
