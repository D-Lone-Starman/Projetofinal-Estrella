// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCmidyYXcgbHeDjWgknFV5dcZq3e6vFjkM",
  authDomain: "projeto-final-c21d3.firebaseapp.com",
  projectId: "projeto-final-c21d3",
  storageBucket: "projeto-final-c21d3.firebasestorage.app",
  messagingSenderId: "315492133419",
  appId: "1:315492133419:web:89f22895a388087adb186e",
  measurementId: "G-1FQG9FJ9Y4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfifireg);
const analytics = getAnalytics(app);