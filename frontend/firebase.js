// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "mealora-food-delivery.firebaseapp.com",
  projectId: "mealora-food-delivery",
  storageBucket: "mealora-food-delivery.firebasestorage.app",
  messagingSenderId: "258166344686",
  appId: "1:258166344686:web:6f9010c8357c18c55c1cff"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth=getAuth(app)
export {app,auth}