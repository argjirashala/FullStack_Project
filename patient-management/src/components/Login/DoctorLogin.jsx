import { useState } from "react";
import { db } from "../../firebase-config";
import { collection, query, where, getDocs } from "firebase/firestore";

const DoctorLogin = () => {
  const [doctorId, setDoctorId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const doctorsCollectionRef = collection(db, "doctors");
      const q = query(doctorsCollectionRef, where("doctorId", "==", doctorId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doctorData = querySnapshot.docs[0].data();

        if (password === doctorData.password) {
          console.log("Doctor logged in successfully:", doctorData);
          alert(`Welcome, ${doctorData.name}!`);
        } else {
          alert("Invalid password. Please try again.");
        }
      } else {
        alert("Doctor ID not found. Please check your credentials.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div>
      <form onSubmit={handleLogin}>
        <h2>Doctor Login</h2>

        <label htmlFor="doctorId">
          Doctor ID
        </label>
        <br />
        <input
          type="text"
          id="doctorId"
          value={doctorId}
          onChange={(e) => setDoctorId(e.target.value)}
          placeholder="Enter your Doctor ID"
          required
        />
        <br />
        <br />

        <label htmlFor="password">
          Password
        </label>
        <br />
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your Password"
          required
        />
        <br />
        <br />

        <button type="submit">
          Login
        </button>
      </form>
    </div>
  );
};

export default DoctorLogin;
