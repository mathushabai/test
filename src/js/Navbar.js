import React, { useEffect, useState } from 'react';
import '../css/Navbar.css';
import { Link } from 'react-router-dom';
import { auth } from './firebase'; // Firebase setup
import { getFirestore, doc, getDoc } from 'firebase/firestore'; // Firestore for role checking

function Navbar() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('guest'); // default to 'guest'

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);

        // Fetch the user's role from Firestore
        const db = getFirestore();
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          setRole(userDoc.data().role); // e.g., 'admin', 'service_provider', 'customer'
        } else {
          setRole('guest');
        }
      } else {
        setUser(null);
        setRole('guest');
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <nav className="main-nav">
      <ul className="navbar-list">
        <li className="navbar-item"><Link to="/">Home</Link></li>

        {role === 'guest' && (
          <>
            <li className="navbar-item"><Link to="/signin">Sign In</Link></li>
            <li className="navbar-item"><Link to="/signup">Sign Up</Link></li>
          </>
        )}

        {role === 'customer' && (
          <>
            <li className="navbar-item"><Link to="/profile">Account</Link></li>
            <li className="navbar-item"><Link to="/bookings">My Bookings</Link></li>
          </>
        )}

        {role === 'service_provider' && (
          <>
            <li className="navbar-item"><Link to="/dashboard">Dashboard</Link></li>
            <li className="navbar-item"><Link to="/appointments">Appointments</Link></li>
          </>
        )}

        {role === 'admin' && (
          <>
            <li className="navbar-item"><Link to="/admin">Admin Panel</Link></li>
          </>
        )}

        {user && (
          <li className="navbar-item"><button onClick={() => auth.signOut()}>Logout</button></li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;