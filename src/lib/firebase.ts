import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBA8pCtNVIR63keNyxoMrT7Id2fj234h0c",
  authDomain: "lucid-seat-5qvh5.firebaseapp.com",
  projectId: "lucid-seat-5qvh5",
  storageBucket: "lucid-seat-5qvh5.firebasestorage.app",
  messagingSenderId: "945470931615",
  appId: "1:945470931615:web:5c59c3bd00c0b69561d8aa"
};

export const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {}, "ai-studio-b3937c94-17dc-4ad7-a1a6-8443da58b2a9");
