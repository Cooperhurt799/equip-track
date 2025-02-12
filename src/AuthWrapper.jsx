// AuthWrapper.jsx
import React, { useState, useEffect } from "react";
import { auth } from "./firebase";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import App from "./App";  // Import your main app content (or the component that contains your check-in/out forms)

function AuthWrapper() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Listen for auth state changes.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setUser(null);
  };

  if (!user) {
    return (
      <div className="auth-container">
        <h2>Please Sign In</h2>
        <form onSubmit={handleSignIn}>
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
          <button type="submit">Sign In</button>
        </form>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <div style={{ textAlign: "right", margin: "10px" }}>
        <button onClick={handleSignOut}>Sign Out</button>
      </div>
      <App />
    </div>
  );
}

export default AuthWrapper;