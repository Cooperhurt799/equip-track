import React, { useState } from "react";
import App from "./App";
import "./AuthWrapper.css";

function AuthWrapper() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validCredentials = {
    email: "demo@example.com",
    password: "password123"
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (email === validCredentials.email && password === validCredentials.password) {
      setIsAuthenticated(true);
    } else {
      setError("Invalid credentials");
    }
    setLoading(false);
  };

  if (isAuthenticated) {
    return <App />;
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            placeholder="Email"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            placeholder="Password"
            required
          />
          {error && <div className="error">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? "Loading..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AuthWrapper;