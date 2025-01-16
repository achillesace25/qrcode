// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBPZS2XgIQN5OGzCcP7ZU6xMSTX-VfOxGk",
  authDomain: "trackit-8f549.firebaseapp.com",
  projectId: "trackit-8f549",
  storageBucket: "trackit-8f549.appspot.com",
  messagingSenderId: "24719993535",
  appId: "1:24719993535:web:38cf2d9cbc88cff2ad740a",
  measurementId: "G-W8CR8Q82J6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Auth
const db = getFirestore(app);
const auth = getAuth(app);

// Initialize Analytics (optional, if you're using Firebase Analytics)
const analytics = getAnalytics(app);

// Export the initialized services
export { app, db, auth, analytics };
