import { useState } from "react";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase-config";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import "./Login.css"; 

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(""); 
  const navigate = useNavigate();
  

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); 
  
    try {
      const usersCollectionRef = collection(db, "patients"); 
      const emailQuery = query(usersCollectionRef, where("email", "==", email));
      const emailSnapshot = await getDocs(emailQuery);
  
      if (emailSnapshot.empty) {
        setError("No account found with this email. Please sign up or check your email address.");
        return;
      }

      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
  
      const userCredential = auth.currentUser;
      const patientDocRef = doc(db, "patients", userCredential.uid);
      const patientDoc = await getDoc(patientDocRef);
  
      if (patientDoc.exists()) {
        const patientData = patientDoc.data();
        console.log("Patient data:", patientData);
  
        navigate("/patient/home", { state: { patientData } });
      } else {
        setError("Patient record not found in Firestore.");
      }
    } catch (error) {
      if (error.code === "auth/invalid-credential") {
        setError("Incorrect password. Please try again."); 
      } else if (error.code === "auth/invalid-email") {
        setError("Invalid email format. Please check and try again.");
      } else {
        setError("An unexpected error occurred. Please try again later.");
      }
    }
  };

  const handleForgotPassword = async () => {
    setError(""); 

    if (!email) {
      setError("Please enter your email to reset your password.");
      return;
    }

    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      setError("Password reset email sent! Check your inbox.");
    } catch (error) {
      console.error("Error sending password reset email:", error);
      setError("Error sending password reset email. Please try again."); 
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <p className="signup-text">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="signup-link">
            Sign up
          </a>
        </p>
        {error && <p className="login-error">{error}</p>}
        <form onSubmit={handleLogin} className="login-form">
          <label htmlFor="email" className="login-label">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />

          <label htmlFor="password" className="login-label">
            Password
          </label>
          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <button
            type="button"
            className="forgot-password"
            onClick={handleForgotPassword}
            disabled={!email}
          >
            Forgot password?
          </button>

          <button type="submit" className="login-button">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
