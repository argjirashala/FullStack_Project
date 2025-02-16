import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase-config";

export const getDoctorById = (doctorId) => {
  const doctorsCollectionRef = collection(db, "doctors");
  const q = query(doctorsCollectionRef, where("doctorID", "==", doctorId));
  return getDocs(q);
};
