// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "buildwise-exah6",
  appId: "1:907491019802:web:7a2139f0b0592b41bb95a3",
  storageBucket: "buildwise-exah6.appspot.com",
  apiKey: "AIzaSyCnYblXm5UP0zpBRnJkJ1kXRXZmWkidQy4",
  authDomain: "buildwise-exah6.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "907491019802"
};


// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
}

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Firebase Storage
export const storage = getStorage(app);
