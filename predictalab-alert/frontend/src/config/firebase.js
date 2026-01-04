import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB5hIl73dFqPuVWRoWeX3iN4bj5g9czHew",
  authDomain: "openai-d9c88.firebaseapp.com",
  databaseURL: "https://openai-d9c88-default-rtdb.firebaseio.com",
  projectId: "openai-d9c88",
  storageBucket: "openai-d9c88.firebasestorage.app",
  messagingSenderId: "414774771506",
  appId: "1:414774771506:web:0883711ea0610e9569212b",
  measurementId: "G-VJ9WKE1L88"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const database = getDatabase(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);

export default app;
