import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCsovizqTMH_c2zCzzvkCUN4UbYUpMBWy8",
  authDomain: "comunidadactiva-df4c3.firebaseapp.com",
  projectId: "comunidadactiva-df4c3",
  storageBucket: "comunidadactiva-df4c3.firebasestorage.app",
  messagingSenderId: "300361180136",
  appId: "1:300361180136:web:e3a8549dff5543ff10ba5d",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);