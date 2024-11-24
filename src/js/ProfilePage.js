import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faPen, faSave, faTrash, faKey, faCircleExclamation, faCheckCircle  } from '@fortawesome/free-solid-svg-icons';
import { getAuth, deleteUser, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import '../css/ProfilePage.css';
import LoadingPage from './LoadingPage';
import CancellationModal from './CancellationModal';
import { sendUserCancellationNotification } from './EmailTemplate';

function ProfilePage({ userId, onLogout }) {
  const [userInfo, setUserInfo] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [isCancellationModalOpen, setIsCancellationModalOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [selectedReason, setSelectedReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ username: '', mobileNumber: '' });
  //const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  //const [mobileNotificationsEnabled, setMobileNotificationsEnabled] = useState(false);
  const [passwordChange, setPasswordChange] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordRequirements, setPasswordRequirements] = useState(null);

  useEffect(() => {
    if (!userId) {
      console.error("No user Id provided to Profile Page.");
      setLoading(false);
      return;
    }

    const fetchUserInfo = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserInfo(userData);
          setEditData({ name: userData.username || '', mobileNumber: userData.mobileNumber || '' });
          //setNotificationsEnabled(userData.notificationsEnabled || false);
          //setMobileNotificationsEnabled(userData.mobileNotificationsEnabled || false);
        } else {
          setUserInfo(null);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [userId]);

  useEffect(() => {
    if (activeSection === "reservations" && userId) {
      fetchReservations();
    }
  }, [activeSection, userId]);

    const fetchReservations = async () => {
      try {
        const reservationsRef = collection(db, 'users', userId, 'bookings');
        const snapshot = await getDocs(reservationsRef);
        
        const reservationsData = snapshot.docs.map(doc => ({
          id: doc.id,
          businessId: doc.data().businessId || "UnknownBusinessId",
          businessEmail: doc.data().businessEmail || "no-email-provided@example.com",
          ...doc.data(),
        }));
        const sortedReservations = reservationsData.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        setReservations(sortedReservations);
      } catch (error) {
        console.error("Error fetching reservations:", error);
      }
    };

  const handleCancelReservation = async () => {
    try {
      // Fallbacks for missing fields
      const reservation = selectedReservation;
      const reservationId = reservation.id;
      const businessId = reservation.businessId || "UnknownBusinessId";
      const businessEmail = reservation.businessEmail || "no-email-provided@example.com";
  
      // Ensure reservation ID exists
      if (!reservationId) {
        alert("Error: Reservation ID is missing.");
        return;
      }
  
      // Check cancellation policy (24-hour rule)
      const reservationDateTime = new Date(`${reservation.date}T${reservation.timeSlot}`);
      const currentTime = new Date();
  
      if (reservationDateTime - currentTime < 24 * 60 * 60 * 1000) {
        alert("Cancellation is only allowed up to 24 hours before the reservation.");
        return;
      }
  
      // Firestore references
      const userBookingRef = doc(db, 'users', userId, 'bookings', reservationId);
      const providerBookingRef = doc(db, 'serviceProviders', businessId, 'bookings', reservationId);
  
      // Delete the reservation from Firestore
      await Promise.all([
        deleteDoc(userBookingRef),
        deleteDoc(providerBookingRef),
      ]);
  
      // Send cancellation notification (if business email is available)
      sendUserCancellationNotification({
        recipientEmail: businessEmail,
        businessName: reservation.businessName || "Unknown Business",
        customerName: userInfo.username || "Customer",
        date: reservation.date,
        timeSlot: reservation.timeSlot,
        cancellationReason: selectedReason,
      });
  
      // Update local state
      setReservations((prevReservations) =>
        prevReservations.filter((res) => res.id !== reservationId)
      );
  
      alert("Reservation canceled successfully.");
    } catch (error) {
      console.error("Error canceling reservation:", error);
      alert("An error occurred while canceling the reservation.");
    } finally {
      setIsCancellationModalOpen(false);
    }
  };

  const openCancellationModal = (reservation) => {
    setSelectedReservation(reservation);
    setSelectedReason('');
    setIsCancellationModalOpen(true);
  };

  const closeCancellationModal = () => {
    setIsCancellationModalOpen(false);
    setSelectedReason('');
  };

  const handleSaveChanges = async () => {
    try {
      const userRef = doc(db, 'users', userId);

      await updateDoc(userRef, {
        username: editData.username,
        mobileNumber: editData.mobileNumber,
      });

      setUserInfo((prevInfo) => ({
        ...prevInfo,
        username: editData.username,
        mobileNumber: editData.mobileNumber,
      })); 

      setIsEditing(false); // Exit edit mode
      alert("Profile updated successfully.");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred while updating the profile.");
    }
  };

/*   const handleToggleNotifications = async () => {
    try {
      const newPreference = !notificationsEnabled;
      await updateDoc(doc(db, 'users', userId), { notificationsEnabled: newPreference });
      setNotificationsEnabled(newPreference);
      alert(`Notifications ${newPreference ? 'enabled' : 'disabled'}.`);
    } catch (error) {
      console.error("Error updating notification preference:", error);
      alert("An error occurred while updating notification preferences.");
    }
  };


  const handleToggleMobileNotifications = async () => {
    try {
      const newPreference = !mobileNotificationsEnabled;
      await updateDoc(doc(db, 'users', userId), { mobileNotificationsEnabled: newPreference });
      setMobileNotificationsEnabled(newPreference);
      alert(`Mobile notifications ${newPreference ? 'enabled' : 'disabled'}.`);
    } catch (error) {
      console.error("Error updating mobile notification preference:", error);
      alert("An error occurred while updating mobile notification preferences.");
    }
  }; */

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);

    return (
      <div className="password-requirements">
        <p style={{ color: minLength ? "green" : "orange" }}>
          <FontAwesomeIcon icon={minLength ? faCheckCircle : faCircleExclamation} /> At least 8 characters
        </p>
        <p style={{ color: hasUpperCase ? "green" : "orange" }}>
          <FontAwesomeIcon icon={hasUpperCase ? faCheckCircle : faCircleExclamation} /> Include an uppercase letter
        </p>
        <p style={{ color: hasLowerCase ? "green" : "orange" }}>
          <FontAwesomeIcon icon={hasLowerCase ? faCheckCircle : faCircleExclamation} /> Include a lowercase letter
        </p>
        <p style={{ color: hasNumber ? "green" : "orange" }}>
          <FontAwesomeIcon icon={hasNumber ? faCheckCircle : faCircleExclamation} /> Include a number
        </p>
        <p style={{ color: hasSpecialChar ? "green" : "orange" }}>
          <FontAwesomeIcon icon={hasSpecialChar ? faCheckCircle : faCircleExclamation} /> Include a special character
        </p>
      </div>
    );
  };

  const handleNewPasswordChange = (e) => {
    const newPassword = e.target.value;
    setPasswordChange(prevState => ({ ...prevState, newPassword }));
    setPasswordRequirements(validatePassword(newPassword));
  };

  const handleConfirmPwChange = (e) => {
    const confirmNewPassword = e.target.value;
    setPasswordChange(prevState => ({ ...prevState, confirmNewPassword }));
    
    if (confirmNewPassword !== passwordChange.newPassword) {
      setPasswordError("Passwords do not match");
    } else {
      setPasswordError("");
    }
  };

  const handlePasswordChange = async () => {
    const { currentPassword, newPassword, confirmNewPassword } = passwordChange;

    if (!currentPassword) {
      alert("Please enter your current password.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      alert("New password and confirmation password do not match.");
      return;
    }

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const credentials = EmailAuthProvider.credential(user.email, currentPassword);

      await reauthenticateWithCredential(user, credentials);
      await updatePassword(user, newPassword);

      alert("Password changed successfully.");
      setPasswordChange({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      setPasswordRequirements(null);
      setPasswordError("");
    } catch (error) {
      console.error("Error changing password:", error);
      alert("An error occurred while changing the password. Please make sure your current password is correct.");
    }
  };

  const handleAccountDeletion = async () => {
    const confirmation = window.confirm("Are you sure you want to delete your account? This action is irreversible.");
    if (!confirmation) return;

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      await db.collection("users").doc(userId).delete();// Delete user data from Firestore
      await deleteUser(user); // Delete user account from Firebase Authentication

      alert("Account deleted successfully.");
      onLogout(); // Log out the user after deletion
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("An error occurred while deleting the account.");
    }
  };

  if (loading) {
    return <LoadingPage />;
  }

  if (!userInfo) {
    return <p>User information not available.</p>;
  }

  return (
    <div>
      <header className="header-section">
        <img src="/dark-logo.png" alt="App Logo" className="home-logo" />
        <h1>SlotSage</h1>
        <ul className="navbar-list">
          <li className="navbar-item">
            <a href="/home"><FontAwesomeIcon icon={faHouse} /></a>
          </li>
        </ul>
      </header>
      <div className="profile-page">
        <aside className="profile-sidebar">
          <button onClick={() => setActiveSection("profile")} className={activeSection === "profile" ? "active" : ""}>Edit Profile</button>
          <button onClick={() => setActiveSection("reservations")} className={activeSection === "reservations" ? "active" : ""}>Reservations</button>
          <button onClick={onLogout} className="logout">Sign Out</button>
        </aside>

        <main className="profile-content">
          {activeSection === "profile" && (
            <div className="profile-info">
              <h2>Edit Profile</h2>
              <label>
                Name
                <input
                  className="profile-input"
                  name="username"
                  value={isEditing ? editData.username : userInfo.username}
                  onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                  readOnly={!isEditing}
                />
              </label>
              <label>
                Email
                <input className="profile-input" name="email" value={userInfo.email} readOnly />
              </label>
              <label>
                Phone
                <input
                  className="profile-input"
                  name="mobileNumber"
                  value={isEditing ? editData.mobileNumber : userInfo.mobileNumber}
                  onChange={(e) => setEditData({ ...editData, mobileNumber: e.target.value })}
                  readOnly={!isEditing}
                />
              </label>

              <div className="profile-actions">
                {isEditing ? (
                  <button onClick={handleSaveChanges}>
                    <FontAwesomeIcon icon={faSave} /> Save Changes
                  </button>
                ) : (
                  <button onClick={() => setIsEditing(true)}>
                    <FontAwesomeIcon icon={faPen} /> Edit
                  </button>
                )}
              </div>

              {/* <div className="notification-preferences">
                <h2>Notification Preferences</h2>
                <label>
                  <input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={handleToggleNotifications}
                  />
                  Enable email notifications
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={mobileNotificationsEnabled}
                    onChange={handleToggleMobileNotifications}
                  />
                  Enable mobile notifications
                </label>
              </div> */}

              <div className="change-password">
                <div>
                  <h2>Change Password</h2>
                  <input
                    type="password"
                    name="currentPassword"
                    className="editPw"
                    placeholder="Current Password"
                    value={passwordChange.currentPassword}
                    onChange={(e) => setPasswordChange({ ...passwordChange, currentPassword: e.target.value })}
                  />
                </div>
                <input
                  type="password"
                  name="newPassword"
                  className="editPw"
                  placeholder="New Password"
                  value={passwordChange.newPassword}
                  onChange={handleNewPasswordChange}
                />
                <input
                  type="password"
                  name="confirmNewPassword"
                  className="editPw"
                  placeholder="Confirm New Password"
                  value={passwordChange.confirmNewPassword}
                  onChange={handleConfirmPwChange}
                />
                {passwordRequirements}
                {passwordError && <p style={{ color: "red" }}>{passwordError}</p>}

                <button className="change-pwBtn" onClick={handlePasswordChange}>
                  <FontAwesomeIcon icon={faKey} /> Change Password
                </button>
              </div>

              <div className="account-deletion">
                <p className="del-warning">Warning! This permanently deletes your SlotSage account.</p>
                <button onClick={handleAccountDeletion} className="delete-account">
                  <FontAwesomeIcon icon={faTrash} /> Delete Account
                </button>
              </div>
            </div>
          )}

          {activeSection === "reservations" && (
            <div>
              <h2>Your Reservations</h2>
              {reservations.length > 0 ? (
                <div className="reservation-list">
                  {reservations.map((reservation) => (
                    <div key={reservation.id} className="reservation-ticket">
                      <p className="reservation-business-name"><strong>{reservation.businessName}</strong></p>
                      <div className="reservation-services">
                        {reservation.services.map((service, index) => (
                          <p key={index} className="reservation-service-item">
                            {service.name} — {service.duration} mins — RM {service.price}
                          </p>
                        ))}
                      </div>
                      <p><label>Date:</label> {reservation.date}</p>
                      <p><label>Time Slot:</label> {reservation.timeSlot}</p>
                      <p><label>Total Cost:</label> RM {reservation.totalCost}</p>
                      <p><label>Address:</label> {reservation.businessAddress}</p>
                      <p><label>Phone:</label> {reservation.businessPhone}</p>
                      <button 
                        className="cancel-button" 
                        onClick={() => openCancellationModal(reservation)}
                      >
                        Cancel Reservation
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No reservations found.</p>
              )}
            </div>
          )}

          {activeSection === "signout" && (
            <div>
              <button onClick={onLogout}>Sign Out</button>
            </div>
          )}
        </main>
      </div>
      <CancellationModal
        isOpen={isCancellationModalOpen}
        onClose={() => setIsCancellationModalOpen(false)}
        onSubmit={handleCancelReservation}
        selectedReason={cancellationReason}
        setSelectedReason={setCancellationReason}
        userType="customer"
      />
    </div>
  );
}

export default ProfilePage;