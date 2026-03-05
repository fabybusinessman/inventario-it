import { getFirestore } from "firebase/firestore";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBS5-66GkNkbyddNV9jz9wqSRCGI0y2ZsM",
  authDomain: "inventariopcf.firebaseapp.com",
  projectId: "inventariopcf",
  storageBucket: "inventariopcf.firebasestorage.app",
  messagingSenderId: "1097033684170",
  appId: "1:1097033684170:web:41ac9750f127027279d033"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Exportar la instancia de la base de datos de Firestore
export const db = getFirestore(app);