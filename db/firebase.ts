// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBqtVc-h9DeaApem8P1PjsbHvkBH4NF9Tc",
  authDomain: "educa-react-be0f2.firebaseapp.com",
  projectId: "educa-react-be0f2",
  storageBucket: "educa-react-be0f2.firebasestorage.app",
  messagingSenderId: "711844814387",
  appId: "1:711844814387:web:bd10718049fc9740dd0d46",
  measurementId: "G-5JWF3JSC8D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);