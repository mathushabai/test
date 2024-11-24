import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from "./firebase";
import './SignIn.css'; 

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignUpNavigation = (type) => {
    if (type === 'customer') {
      navigate("/signup");
    } else if (type === 'service-provider') {
      navigate("/SPSignUp"); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('User successfully signed in:');
  
      const user = auth.currentUser;
      if (user) {
        // Check if the user is an admin
        const adminRef = doc(db, "admins", user.uid);
        const adminSnap = await getDoc(adminRef);
        if (adminSnap.exists()) {
          navigate("/admin");
          return;
        }
  
        // Check if the user is a service provider
        const serviceProviderRef = doc(db, "serviceProviders", user.uid);
        const serviceProviderSnap = await getDoc(serviceProviderRef);
        if (serviceProviderSnap.exists()) {
          navigate("/dashboard");
          return;
        }
  
        // Check if the user is a customer
        const customerRef = doc(db, "users", user.uid);
        const customerSnap = await getDoc(customerRef);
        if (customerSnap.exists()) {
          navigate("/home");
          return;
        }
  
        // If no role is found
        console.error("User role not found in Firestore.");
        setError("User role not found. Please contact support.");
      }
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        setError("No user found with this email.");
      } else if (error.code === "auth/wrong-password") {
        setError("Incorrect password.");
      } else {
        setError("Failed to sign in. Please try again.");
      }
      console.error("Sign-in error:", error);
    }
  };

  return (
    <div className="bg">
      <img className="imgSU" src="/dark-logo.png" alt="App Logo" />
      <div className="signIn-container">
        <h2 className="SI-header">Sign In</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="SIform-group">
            <label className='SI-label'>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="SIform-group">
            <label className='SI-label'>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="SIform-group">
            <Link to="/forgot-password" className="forgot-pw">
              Forgot Password?
            </Link>
          </div>
          <button type="submit" className="SI-sub submit-btn">Sign In</button>
        </form>

        <div className="SIform-group">
          <p className="SI-text">Don't have an account? Register below:</p>
          <button 
            className="reg-btn" 
            onClick={() => handleSignUpNavigation('customer')}>
            Customer Sign Up
          </button>
          <button 
            className="reg-btn" 
            onClick={() => handleSignUpNavigation('service-provider')}>
            Service Provider Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}

export default SignIn;