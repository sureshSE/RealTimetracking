// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signOut } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAzZbZr4VoMaYAAxZzJaE0q-8Akqh4DuM0",
  authDomain: "route-app-ca1cf.firebaseapp.com",
  projectId: "route-app-ca1cf",
  storageBucket: "route-app-ca1cf.firebasestorage.app",
  messagingSenderId: "370441768555",
  appId: "1:370441768555:web:0e95dc01f26bc39118eb2e",
  measurementId: "G-0JSSDDEPCH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
