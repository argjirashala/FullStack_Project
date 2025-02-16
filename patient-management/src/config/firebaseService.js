import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "./firebase-config";

const firebaseService = {
  signIn: (email, password) => {
    const auth = getAuth();
    return signInWithEmailAndPassword(auth, email, password);
  },
  getPatientByEmail: (email) => {
    const usersCollectionRef = collection(db, "patients");
    const emailQuery = query(usersCollectionRef, where("email", "==", email));
    return getDocs(emailQuery);
  },
  getPatientData: (uid) => {
    const patientDocRef = doc(db, "patients", uid);
    return getDoc(patientDocRef);
  },
  sendPasswordReset: (email) => {
    const auth = getAuth();
    return sendPasswordResetEmail(auth, email);
  },
};

export default firebaseService;
