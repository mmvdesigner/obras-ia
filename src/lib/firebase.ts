// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "buildwise-exah6",
  appId: "1:907491019802:web:7a2139f0b0592b41bb95a3",
  storageBucket: "buildwise-exah6.firebasestorage.app",
  apiKey: "AIzaSyCnYblXm5UP0zpBRnJkJ1kXRXZmWkidQy4",
  authDomain: "buildwise-exah6.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "907491019802"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
