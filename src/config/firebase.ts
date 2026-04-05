import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase web config is also used for Expo React Native SDK initialization.
// Do not initialize firebase/analytics in React Native (web-only module).
const firebaseConfig = {
  apiKey: 'AIzaSyBV8UU7Yl-BgzRBSSl-O6a7Bk4RMK8CkAI',
  authDomain: 'baitap-46c7a.firebaseapp.com',
  projectId: 'baitap-46c7a',
  storageBucket: 'baitap-46c7a.firebasestorage.app',
  messagingSenderId: '739439005653',
  appId: '1:739439005653:web:fd3c91970cd18f323e375c',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
