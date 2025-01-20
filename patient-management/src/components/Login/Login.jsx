import { useState } from "react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Email:", email);
    console.log("Password:", password);
  };

  const handleForgotPassword = () => {
    console.log("Forgot Password clicked");
  };

  return (
    <div>
      <form onSubmit={handleLogin}>
        <h2 >Login</h2>
        <label htmlFor="email">
          Email
        </label>
        <br />
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
        <br /> <br />
        <label htmlFor="password">
          Password
        </label>
        <br />
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />
        <br /><br />
        <button type="submit">
          Login
        </button>
        <br /> <br />
        <button
          type="button"
          onClick={handleForgotPassword}
        >
          Forgot Password?
        </button>
      </form>
    </div>
  );
}

export default Login;