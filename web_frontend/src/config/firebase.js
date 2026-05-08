import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDnGJ0tlSrAEgR4X3-OcVveTF7pcKTZZxc",
  authDomain: "proti-binimoy123.firebaseapp.com",
  projectId: "proti-binimoy123",
  storageBucket: "proti-binimoy123.firebasestorage.app",
  messagingSenderId: "791336886938",
  appId: "1:791336886938:web:32066acc926de0df9cf523",
  measurementId: "G-0B6RKZ7MZ6"
};

export const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);