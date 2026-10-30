import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase web config is public, so it lives in code rather than hosting env vars.
const firebaseConfig = {
  apiKey: "AIzaSyCGRvVcUN4WkWx_bxUVt1wJKcONjJBgz1k",
  authDomain: "medvault-6f6c2.firebaseapp.com",
  projectId: "medvault-6f6c2",
  storageBucket: "medvault-6f6c2.firebasestorage.app",
  messagingSenderId: "62275698530",
  appId: "1:62275698530:web:f2e6326b2ba698b811763b"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
