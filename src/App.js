import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import './App.css';

import CustHome from './js/CustHome';
import Dashboard from './js/Dashboard';
import SignIn from './SignIn';
import ForgotPassword from './js/ForgotPassword';
import SignUp from './js/SignUp';
import SP_SignUp from './js/SP_SignUp';
import LoadingPage from './js/LoadingPage';
import BusinessPage from './js/BusinessPage';
import BookingPage from './js/BookingPage';
import ProfilePage from './js/ProfilePage';
import AdminDash from './js/AdminDash';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setIsAuthenticated(true);
        const userType = await fetchUserType(user.uid);
        setUserId(user.uid);
        setUserType(userType);
        setLoading(false); 
      } else {
        setIsAuthenticated(false);
        setUserType(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserType = async (uid) => {
    try {
      // Check if the user is an admin
      const adminRef = doc(db, "admins", uid);
      const adminSnap = await getDoc(adminRef);
      if (adminSnap.exists()) return 'admin';
  
      // Check if the user is a service provider
      const SPref = doc(db, "serviceProviders", uid);
      const SPsnap = await getDoc(SPref);
      if (SPsnap.exists()) return 'service-provider';
  
      // Check if the user is a customer
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) return 'customer';
  
      // If no role is found
      return null;
    } catch (error) {
      console.error("Error fetching user type:", error);
      return null;
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsAuthenticated(false);
      setUserType(null);
      navigate("/signin", { replace: true });
    } catch (error) {
      console.error("Error logging out: ", error);
    }
  };

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate 
              to={
                userType === 'admin' 
                  ? "/admin" 
                  : userType === 'service-provider' 
                  ? "/dashboard" 
                  : "/home"
              } 
              replace 
            />
          ) : (
            <Navigate to="/signin" replace />
          )
        }
      />
      <Route path="/admin" element={<AdminDash />} />
      <Route path="/home" element={<CustHome onLogout={handleLogout} />} />
      <Route path="/business/:businessId" element={<BusinessPage onLogout={handleLogout} />} />
      <Route path="/book/:businessId" element={<BookingPage onLogout={handleLogout} />} />
      <Route path="/profile" element={<ProfilePage userId={userId} onLogout={handleLogout} />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/SPSignUp" element={<SP_SignUp />} />
      <Route path="/dashboard" element={<Dashboard onLogout={handleLogout} />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
    </Routes>
  );
}

export default App;