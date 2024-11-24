import React, { useState } from 'react';
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from '../firebase';
import '../css/ForgotPassword.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent. Please check your inbox.');
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        setError('No user found with this email.');
      } else {
        setError('Failed to send password reset email. Please try again.');
      }
    }
  };

  return (
    <div className="bg">
        <img className="imgSU" src="/dark-logo.png" alt="App Logo" />
        <div className="forgot-password-container">
        <h2>Password Reset</h2>
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handlePasswordReset}>
            <div className="form-group">
            <label className="forgot-pw-label">Email</label>
            <input
            className="forgot-pw-input"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            </div>
            <button type="submit" className="reset-btn">Send Reset Link</button>
        </form>
        </div>
    </div>
  );
}

export default ForgotPassword;