import React, { useState } from "react";
import App from "./App";
import "./AuthWrapper.css";

function AuthWrapper() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation
    if (email === "admin@example.com" && password === "password") {
      setUser({ email });
      setError("");
    } else {
      setError("Invalid credentials");
    }
  };

  const handleSignOut = () => {
    setUser(null);
  };

  if (!user) {
    return (
      <div className="auth-wrapper">
        <div className="auth-container">
          <h2>Sign In</h2>
          <form onSubmit={handleSubmit}>
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="error">{error}</p>}
            <button type="submit">Sign In</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="sign-out-container">
        <button onClick={handleSignOut}>Sign Out</button>
      </div>
      <App />
    </div>
  );
}

export default AuthWrapper;