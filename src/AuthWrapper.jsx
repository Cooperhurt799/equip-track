// AuthWrapper.jsx
import React, { useState, useEffect } from "react";
import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import App from "./App";
import "./AuthWrapper.css";

function AuthWrapper() {
  const [user, setUser] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // State variable to store equipment data
  const [equipmentList, setEquipmentList] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Fetch equipment data when the user is authenticated
    if (user) {
      fetch("https://your-api-endpoint.com/equipment") // Replace with your actual API endpoint
        .then((res) => res.json())
        .then((data) => setEquipmentList(data))
        .catch((error) => console.error("Error fetching equipment data:", error));
    }
  }, [user]); // Run this effect only when the user state changes

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (isRegistering) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        setUser(userCredential.user);
      } catch (err) {
        setError(err.message);
      }
    } else {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        setUser(userCredential.user);
      } catch (err) {
        setError(err.message);
      }
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setUser(null);
  };

  if (!user) {
    return (
      <div className="auth-wrapper">
        <div className="auth-container">
          <h2>{isRegistering ? "Register" : "Sign In"}</h2>
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
            <button type="submit" disabled={loading}>
              {loading ? "Loading..." : isRegistering ? "Register" : "Sign In"}
            </button>
          </form>
          <p>
            {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
            <button onClick={() => {
              setIsRegistering(!isRegistering);
              setError("");
            }}>
              {isRegistering ? "Sign In" : "Register"}
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="sign-out-container">
        <button onClick={handleSignOut}>Sign Out</button>
      </div>
      {/* Pass equipmentList as a prop to App */}
      <App equipmentList={equipmentList} /> 
    </div>
  );
}

export default AuthWrapper;