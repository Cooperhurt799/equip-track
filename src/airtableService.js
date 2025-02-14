import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBGI1ePIuM8qH-HU7m0KoHWWTelNL8Rw7I",
  authDomain: "ranch-asset-tracker.firebaseapp.com",
  projectId: "ranch-asset-tracker",
  storageBucket: "ranch-asset-tracker.appspot.com",
  messagingSenderId: "599725599196",
  appId: "1:599725599196:web:d70da6968196e0a0e7b593"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const getCheckouts = async () => {
  try {
    const q = query(collection(db, 'checkouts'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
  } catch (error) {
    console.error('Error fetching checkouts:', error);
    throw error;
  }
};

export const getCheckins = async () => {
  try {
    const q = query(collection(db, 'checkins'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
  } catch (error) {
    console.error('Error fetching checkins:', error);
    throw error;
  }
};

export const addCheckoutToAirtable = async (checkoutData) => {
  try {
    const docRef = await addDoc(collection(db, 'checkouts'), checkoutData);
    return docRef;
  } catch (error) {
    console.error('Error adding checkout:', error);
    throw error;
  }
};

export const addCheckinToAirtable = async (checkinData) => {
  try {
    const docRef = await addDoc(collection(db, 'checkins'), checkinData);
    return docRef;
  } catch (error) {
    console.error('Error adding checkin:', error);
    throw error;
  }
};