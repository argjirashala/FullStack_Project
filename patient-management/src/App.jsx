import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./config/firebase-config";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import PatientView from "./components/Patient/PatientView";
import DoctorLogin from "./components/Login/DoctorLogin";
import DoctorView from "./components/Doctor/DoctorView";

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (window.Cypress) {
      setUser({
        uid: "fakeUid",
        personalId: "P123",  
        firstName: "Test",
        lastName: "Patient",
        email: "test@example.com",
      });
      setLoading(false);
      return;
    }

    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const patientDocRef = doc(db, "patients", currentUser.uid);
          const patientDoc = await getDoc(patientDocRef);

          if (patientDoc.exists()) {
            setUser({ uid: currentUser.uid, ...patientDoc.data() });
          } else {
            console.error("No patient data found for this user.");
          }
        } catch (error) {
          console.error("Error fetching patient data:", error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />
        <Route
          path="/patient/*"
          element={user ? <PatientView user={user} /> : <Navigate to="/login" />}
        />
        <Route path="/doctor-login" element={<DoctorLogin />} />
        <Route path="/doctor/*" element={<DoctorView />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </div>
  );
};

export default App;

