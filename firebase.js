// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDGUsBTGiFgxiZT3jhdyKTqRIGl7eb3oD4",
  authDomain: "my-finance-5253a.firebaseapp.com",
  projectId: "my-finance-5253a",
  storageBucket: "my-finance-5253a.firebasestorage.app",
  messagingSenderId: "759839988047",
  appId: "1:759839988047:web:950e1bf43280331ad68d3a"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);