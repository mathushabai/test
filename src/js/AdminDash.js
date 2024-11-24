import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import '../css/AdminDash.css'; 

const AdminDash = () => {
  const [pendingProviders, setPendingProviders] = useState([]);
  const navigate = useNavigate();

  // Fetch all pending providers when the component loads
  useEffect(() => {
    const fetchPendingProviders = async () => {
      try {
        const serviceProvidersRef = collection(db, "serviceProviders");
        const q = query(serviceProvidersRef, where("accountStatus", "==", "pending"));
        const snapshot = await getDocs(q);

        const providers = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPendingProviders(providers);
      } catch (error) {
        console.error("Error fetching pending service providers:", error);
      }
    };

    fetchPendingProviders();
  }, []);

  const updateAccountStatus = async (providerId, status) => {
    try {
      const providerRef = doc(db, "serviceProviders", providerId);
      await updateDoc(providerRef, { accountStatus: status });
      setPendingProviders(prev => prev.filter(provider => provider.id !== providerId));
      console.log(`Service provider ${providerId} marked as ${status}.`);
    } catch (error) {
      console.error(`Error updating provider status to ${status}:`, error);
    }
  };

  const deleteProvider = async (providerId) => {
    if (window.confirm("Are you sure you want to delete this provider? This action cannot be undone.")) {
      try {
        await deleteDoc(doc(db, "serviceProviders", providerId));
        setPendingProviders(prev => prev.filter(provider => provider.id !== providerId));
        console.log(`Service provider ${providerId} deleted.`);
      } catch (error) {
        console.error("Error deleting provider:", error);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/signin", { replace: true }); // Redirect to sign-in page after logout
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h2>Admin Dashboard</h2>
        <button className="logout-btn" onClick={handleLogout}>
          Sign Out
        </button>
      </header>
      
      <h3>Pending Service Providers</h3>
      {pendingProviders.length > 0 ? (
        pendingProviders.map(provider => (
          <div key={provider.id} className="provider-card">
            <h4>{provider.businessName}</h4>
            <p>Address: {provider.businessAddress}</p>

            {/* Business License Viewer */}
            {provider.businessLicenseUrl ? (
              <a href={provider.businessLicenseUrl} target="_blank" rel="noopener noreferrer">
                View Business License
              </a>
            ) : (
              <p>No business license uploaded.</p>
            )}

            {/* Approve, Decline, and Delete Buttons */}
            <button onClick={() => updateAccountStatus(provider.id, "approved")}>Approve</button>
            <button onClick={() => updateAccountStatus(provider.id, "declined")}>Decline</button>
            <button onClick={() => deleteProvider(provider.id)} style={{ color: "red" }}>Delete</button>
          </div>
        ))
      ) : (
        <p>No pending service providers.</p>
      )}
    </div>
  );
};

export default AdminDash;