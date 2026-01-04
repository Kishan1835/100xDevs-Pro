// Firebase Configuration for Backend
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyB5hIl73dFqPuVWRoWeX3iN4bj5g9czHew",
  authDomain: "openai-d9c88.firebaseapp.com",
  databaseURL: "https://openai-d9c88-default-rtdb.firebaseio.com",
  projectId: "openai-d9c88",
  storageBucket: "openai-d9c88.firebasestorage.app",
  messagingSenderId: "645410135022",
  appId: "1:645410135022:web:c8ea2b17e79a0dc68f1d5c",
  measurementId: "G-5W2WY7VZN2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
