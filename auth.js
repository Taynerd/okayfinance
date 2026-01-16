// auth.js
import { auth } from "./firebase.js";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const provider = new GoogleAuthProvider();

// LOGIN
export function loginComGoogle() {
  return signInWithPopup(auth, provider);
}

// LOGOUT
export function logout() {
  return signOut(auth);
}

// OBSERVADOR CENTRAL
export function observarLogin(callback) {
  onAuthStateChanged(auth, callback);
}
