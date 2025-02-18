import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../config/firebase-config";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import "./Register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    personalId: "",
    firstName: "",
    lastName: "",
    birthday: "",
    address: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (
      (name === "firstName" || name === "lastName") &&
      /[^a-zA-Z ]/.test(value)
    ) {
      return;
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateInputs = () => {
    const phoneRegex = /^\+\d+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

    if (!formData.firstName || !formData.lastName) {
      setError("First and Last Name are required.");
      return false;
    }
    if (!formData.birthday) {
      setError("Please select your birthday.");
      return false;
    }
    if (!phoneRegex.test(formData.phone)) {
      setError(
        "Phone number must start with a '+' followed by digits (e.g., +123456789)."
      );
      return false;
    }
    if (!passwordRegex.test(formData.password)) {
      setError(
        "Password must be at least 8 characters long and include both letters and numbers."
      );
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return false;
    }
    return true;
  };

  const checkUserExists = async () => {
    const patientsCollection = collection(db, "patients");

    const emailQuery = query(
      patientsCollection,
      where("email", "==", formData.email)
    );
    const emailSnapshot = await getDocs(emailQuery);

    if (!emailSnapshot.empty) {
      setError(
        <>
          An account with this email already exists. Please try{" "}
          <a href="/login" className="login-link">
            logging in
          </a>
          .
        </>
      );
      return true;
    }

    const idQuery = query(
      patientsCollection,
      where("personalId", "==", formData.personalId)
    );
    const idSnapshot = await getDocs(idQuery);

    if (!idSnapshot.empty) {
      setError(
        <>
          An account with this personal ID already exists. Please try{" "}
          <a href="/login" className="login-link">
            logging in
          </a>
          .
        </>
      );
      return true;
    }

    return false;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateInputs()) return;

    try {
      const userExists = await checkUserExists();
      if (userExists) return;

      const auth = getAuth();

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      const patientDocRef = doc(db, "patients", user.uid);
      await setDoc(patientDocRef, {
        personalId: formData.personalId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        birthday: formData.birthday,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
      });

      setSuccess("Sign up successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 3000);

      setFormData({
        personalId: "",
        firstName: "",
        lastName: "",
        birthday: "",
        address: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error registering user:", error);
      setError("An error occurred during registration. Please try again.");
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2 className="register-title">Sign Up</h2>
        {error && <p className="register-error">{error}</p>}
        <form onSubmit={handleRegister} className="register-form">
          <label htmlFor="personalId" className="register-label">
            Personal Id
          </label>
          <input
            type="text"
            id="personalId"
            name="personalId"
            className="register-input"
            value={formData.personalId}
            onChange={handleChange}
            required
          />

          <label htmlFor="firstName" className="register-label">
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            className="register-input"
            value={formData.firstName}
            onChange={handleChange}
            required
          />

          <label htmlFor="lastName" className="register-label">
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            className="register-input"
            value={formData.lastName}
            onChange={handleChange}
            required
          />

          <label htmlFor="birthday" className="register-label">
            Birthday
          </label>
          <input
            type="date"
            id="birthday"
            name="birthday"
            className="register-input"
            value={formData.birthday}
            onChange={handleChange}
            required
          />

          <label htmlFor="address" className="register-label">
            Address
          </label>
          <input
            type="text"
            id="address"
            name="address"
            className="register-input"
            value={formData.address}
            onChange={handleChange}
          />

          <label htmlFor="phone" className="register-label">
            Phone
          </label>
          <input
            type="text"
            id="phone"
            name="phone"
            className="register-input"
            placeholder="+123456789"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          <label htmlFor="email" className="register-label">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="register-input"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="password" className="register-label">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="register-input"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <label htmlFor="confirmPassword" className="register-label">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            className="register-input"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <button type="submit" className="register-button">
            Sign Up
          </button>
          {success && (
            <div className="register-success">
              <p>{success}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Register;
