import { useState } from "react";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth"; 
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      console.log("Logged in successfully:", userCredential.user);

      alert("Login successful!");

      // Redirect to the patient's view
      navigate("/patient/home");
    } catch (error) {
      console.error("Error during login:", error);
      alert(error.message);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert("Please enter your email to reset your password.");
      return;
    }
  
    try {
      const auth = getAuth();
  
      await sendPasswordResetEmail(auth, email);
  
      alert("Password reset email sent! Check your inbox.");
    } catch (error) {
      console.error("Error sending password reset email:", error);
      alert(error.message);
    }
  }

  return (
    <div>
      <form onSubmit={handleLogin}>
        <h2>Login</h2>

        <label htmlFor="email">Email</label>
        <br />
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
        <br />
        <br />

        <label htmlFor="password">Password</label>
        <br />
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />
        <br />
        <br />

        <button type="submit">Login</button>
        <br />
        <br />

        <button
          type="button"
          onClick={handleForgotPassword}
          disabled={!email}
        >
          Forgot Password?
        </button>
      </form>
    </div>
  );
};

export default Login;
