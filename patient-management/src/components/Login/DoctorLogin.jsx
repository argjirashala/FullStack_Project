import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DoctorLogin.css";
import { getDoctorById as getDoctorByIdImported } from "../../config/doctorLoginService";

const DoctorLogin = () => {
  const [doctorId, setDoctorId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); 
  const navigate = useNavigate();

  const getDoctorById = window.doctorLoginService?.getDoctorById || getDoctorByIdImported;

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const querySnapshot = await getDoctorById(doctorId);

      if (!querySnapshot.empty) {
        const doctorData = querySnapshot.docs[0].data();

        if (password === doctorData.password) {
          console.log("Doctor logged in successfully:", doctorData);
          localStorage.setItem("doctorData", JSON.stringify(doctorData));
          navigate("/doctor/home");
        } else {
          setError("Invalid password. Please try again.");
        }
      } else {
        setError("Doctor ID not found. Please check your credentials.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setError("An error occurred. Please try again.");
    }
  };


  return (
    <div className="doctor-login-container">
      <div className="doctor-login-box">
        <h2 className="doctor-login-title">Doctor Login</h2>
        {error && <p className="doctor-login-error">{error}</p>} 
        <form onSubmit={handleLogin} className="doctor-login-form">
          <label htmlFor="doctorId" className="doctor-login-label">
            Doctor ID
          </label>
          <input
            type="text"
            id="doctorId"
            className="doctor-login-input"
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            placeholder="Enter your Doctor ID"
            required
          />

          <label htmlFor="password" className="doctor-login-label">
            Password
          </label>
          <div className="doctor-password-container">
            <input
              type="password"
              id="password"
              className="doctor-login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your Password"
              required
            />
          </div>
          <button type="submit" className="doctor-login-button">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default DoctorLogin;
