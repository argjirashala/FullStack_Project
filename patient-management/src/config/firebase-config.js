import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: import.meta.env?.VITE_API_KEY || "dummy-api-key",
  authDomain: import.meta.env?.VITE_AUTH_DOMAIN || "dummy.firebaseapp.com",
  projectId: import.meta.env?.VITE_PROJECT_ID || "dummy-project",
  storageBucket: import.meta.env?.VITE_STORAGE_BUCKET || "dummy.appspot.com",
  messagingSenderId:
    import.meta.env?.VITE_MESSAGING_SENDER_ID || "dummy-messaging-sender",
  appId: import.meta.env?.VITE_APP_ID || "dummy-app-id",
  measurementId: import.meta.env?.VITE_MEASUREMENT_ID || "dummy-measurement-id",
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db };
