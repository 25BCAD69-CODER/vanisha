/* ---------------------------------------------------------
   Firebase Configuration & Initialization
   --------------------------------------------------------- */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCAsbLEDotEUbp_mB7WzmOQCdM4t2LrrNU",
  authDomain: "portfolio-b6e85.firebaseapp.com",
  projectId: "portfolio-b6e85",
  storageBucket: "portfolio-b6e85.firebasestorage.app",
  messagingSenderId: "184081520623",
  appId: "1:184081520623:web:cdd8971ef33be1dc35c81a",
  measurementId: "G-Y8P4ECFY6K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

console.log("🔥 Firebase & Firestore Initialized");

export { app, analytics, db };
