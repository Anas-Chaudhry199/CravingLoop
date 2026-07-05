// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "cravingloop-eb83e.firebaseapp.com",
  projectId: "cravingloop-eb83e",
  storageBucket: "cravingloop-eb83e.firebasestorage.app",
  messagingSenderId: "768345599955",
  appId: "1:768345599955:web:a790b9f962a016fe02c926"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth }