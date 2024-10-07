import React, { useState } from "react";
import './SignUp.css';
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "./firebase"; // Import Firestore instance

function SP_SignUp({ onSignInClick, onSignUp }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [pricing, setPricing] = useState('');
  const [error, setError] = useState('');  // Properly defining error state

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');  // Reset previous error messages

    try {
      // Validate the input
      if (!username || !password || !mobileNumber || !serviceName || !businessAddress || !pricing) {
        setError('Please fill in all the fields.');
        return;
      }

      const docId = `service_provider_${username}`;

      // Add service provider data to Firestore
      await db.collection('users').doc(docId).set({
        username,
        password,
        mobileNumber,
        serviceName,
        businessAddress,
        pricing,
        userType: 'service-provider',
      });

      // Handle success
      onSignUp();
    } catch (error) {
      console.error("Error signing up: ", error);
      setError('Failed to sign up. Please try again.');
    }
  };

  return (
    <div className="sign-up-page">
      <form onSubmit={handleSignUp}>
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Mobile Number</label>
          <input
            type="tel"
            placeholder="Enter your mobile number"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Service Name</label>
          <input
            type="text"
            placeholder="Enter your service name"
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Business Address</label>
          <input
            type="text"
            placeholder="Enter your business address"
            value={businessAddress}
            onChange={(e) => setBusinessAddress(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Pricing</label>
          <input
            type="text"
            placeholder="Enter your pricing details"
            value={pricing}
            onChange={(e) => setPricing(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-text">{error}</p>}
        <button type="submit" className="submit-btn">Sign Up</button>
      </form>
    </div>
  );
};

export default SP_SignUp;