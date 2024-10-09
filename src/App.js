import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { auth } from './js/firebase';
import './App.css';

import Navbar from './js/Navbar';
import CustHome from './js/CustHome';
import ServiceList from './js/ServiceList';
//import BookingPage from './BookingPage';
import Dashboard from './js/Dashboard';
import SignIn from './SignIn';
import SignUp from './js/SignUp';
//import NotFoundPage from './NotFoundPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user); // Set authentication state based on Firebase user session
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={isAuthenticated ? <CustHome /> : <Navigate to="/signin" />} />
        <Route path="/signin" element={<SignIn setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/signup" element={<SignUp />} />
        {isAuthenticated && (
          <>
            <Route path="/services" element={<ServiceList />} />
            //<Route path="/dashboard" element={<Dashboard />} />
          </>
        )}
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Routes>
    </Router>
  );  
}

export default App;