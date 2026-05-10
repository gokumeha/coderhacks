import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDsTaPrxOVQnVGTy8XCgjUZAR17dYADx1M",
  authDomain: "fishflow-e7add.firebaseapp.com",
  projectId: "fishflow-e7add",
  storageBucket: "fishflow-e7add.firebasestorage.app",
  messagingSenderId: "418376945166",
  appId: "1:418376945166:web:0905a643b8f0183afc765f",
  measurementId: "G-1JQ2S1Q56C"
};

// Ensure Firebase is only initialized once
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const auth = getAuth(app);