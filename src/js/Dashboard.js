import React, { useState, useEffect } from "react";
import '../css/Dashboard.css'; 
import { db, auth, storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, getDocs } from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import CancellationModal from "./CancellationModal";

function Dashboard({ onLogout }) {
  const [activeSection, setActiveSection] = useState("bookings");
  const [bookings, setBookings] = useState([]); 
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({ 
    name: "", 
    price: 0, 
    totalDuration: 0, 
    description: ""
  });
  const [accountStatus, setAccountStatus] = useState("");
  const [businessInfo, setBusinessInfo] = useState({
    name: "",
    address: "",
    mobileNumber: "",
    businessDescription: "",
    businessImageUrl: "",
  });
  const [newBusinessImage, setNewBusinessImage] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [isCancellationModalOpen, setIsCancellationModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");

  useEffect(() => {
    const fetchProviderData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "serviceProviders", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setAccountStatus(data.accountStatus || "pending");
          // Load business information into the state
          setBusinessInfo({
            name: data.businessName || "", 
            address: data.businessAddress || "",
            mobileNumber: data.mobileNumber || "",
            businessDescription: data.businessDescription || "",
            businessImageUrl: data.businessImageUrl || "",
          });
        }
      }
    };

    fetchProviderData();
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      const user = auth.currentUser;
      if (user) {
        const serviceProviderRef = doc(db, "serviceProviders", user.uid);
        const serviceProviderDoc = await getDoc(serviceProviderRef);
        
        if (serviceProviderDoc.exists()) {
          setServices(serviceProviderDoc.data().services || []);
        }
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      const user = auth.currentUser;
      if (user) {
        const bookingCollection = collection(db, "serviceProviders", user.uid, "bookings");
        const bookingSnapshot = await getDocs(bookingCollection);
        const bookingList = bookingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const sortedBookings = bookingList.sort((a, b) => new Date(a.date) - new Date(b.date));
        setBookings(sortedBookings);
      }
    };

    fetchBookings();
  }, []);

  const openCancellationModal = (reservation) => {
    setSelectedReservation(reservation);
    setIsCancellationModalOpen(true);
  };

  const handleCancelReservation = async () => {
    try {
      const user = auth.currentUser;
      if (user && selectedReservation) {
        const { id } = selectedReservation;
        const serviceProviderBookingRef = doc(
          db,
          "serviceProviders",
          user.uid,
          "bookings",
          id
        );

        // Delete the booking from Firestore
        await updateDoc(serviceProviderBookingRef, {
          status: "canceled",
          cancellationReason,
        });

        // Update UI
        setBookings((prevBookings) =>
          prevBookings.filter((booking) => booking.id !== id)
        );

        alert("Reservation canceled successfully.");
      }
    } catch (error) {
      console.error("Error canceling reservation:", error);
      alert("Failed to cancel reservation.");
    } finally {
      setIsCancellationModalOpen(false);
      setSelectedReservation(null);
    }
  };

  const handleBusinessInfoUpdate = async () => {
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, "serviceProviders", user.uid);

      try {
        let imageUrl = businessInfo.businessImageUrl;

        // If a new image is uploaded, upload it to Firebase Storage
        if (newBusinessImage) {
          const imageRef = ref(storage, `businessImages/${newBusinessImage.name}`);
          const snapshot = await uploadBytes(imageRef, newBusinessImage);
          imageUrl = await getDownloadURL(snapshot.ref);
        }

        // Update Firestore with the new details
        await updateDoc(userRef, {
          businessName: businessInfo.name,
          businessAddress: businessInfo.address,
          mobileNumber: businessInfo.mobileNumber,
          businessDescription: businessInfo.businessDescription,
          businessImageUrl: imageUrl,
        });

        setBusinessInfo((prevInfo) => ({
          ...prevInfo,
          businessImageUrl: imageUrl,
        }));

        alert("Business information updated successfully.");
      } catch (error) {
        console.error("Error updating business information:", error);
        alert("Failed to update business information.");
      }
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (user) {
        const serviceProviderDoc = doc(db, "serviceProviders", user.uid);
        
        const newServiceData = {
          ...newService,
          price: parseFloat(newService.price),
          totalDuration: parseInt(newService.totalDuration),
          description: newService.description
        };

        await updateDoc(serviceProviderDoc, {
          services: arrayUnion(newServiceData)
        });

        setServices([...services, newService]);
        setNewService({ name: "", price: 0, totalDuration: 0 }); 
      }
    } catch (error) {
      console.error("Error adding service: ", error);
    }
  };

  const handleEditService = (service) => {
    setEditingService(service); 
    setNewService(service);
  };

  const handleUpdateService = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const serviceProviderDoc = doc(db, "serviceProviders", user.uid);

        const updatedService = {
          ...newService,
          price: parseFloat(newService.price),
          totalDuration: parseInt(newService.totalDuration),
          description: newService.description,
        };
        await updateDoc(serviceProviderDoc, {
          services: arrayRemove(editingService) // Remove the old service
        });
        await updateDoc(serviceProviderDoc, {
          services: arrayUnion(updatedService) // Add the updated service
        });

        setServices((prevServices) =>
          prevServices.map((s) => (s === editingService ? updatedService : s))
        );

        setEditingService(null); // Exit edit mode
        setNewService({ name: "", price: 0, totalDuration: 0 });
      }
    } catch (error) {
      console.error("Error updating service: ", error);
    }
  };

  const handleDeleteService = async (service) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const serviceProviderDoc = doc(db, "serviceProviders", user.uid);
        await updateDoc(serviceProviderDoc, {
          services: arrayRemove(service)
        });
        setServices(services.filter((s) => s !== service)); // Remove service locally
      }
    } catch (error) {
      console.error("Error deleting service:", error);
    }
  };

  return (
    <div className="dashboard-container">
      <nav className="sidebar">
        <h2>Service Provider</h2>
        <ul>
          <li className={activeSection === "bookings" ? "active" : ""} onClick={() => setActiveSection("bookings")}>
            View Bookings
          </li>
          <li className={activeSection === "services" ? "active" : ""} onClick={() => setActiveSection("services")}>
            Manage Services
          </li>
          <li className={activeSection === "settings" ? "active" : ""} onClick={() => setActiveSection("settings")}>
            Profile Settings
          </li>
          <li onClick={onLogout} className="logout">
            Sign Out
          </li>
        </ul>
      </nav>

      <div className="main-content">
        {accountStatus === "pending" && (
          <div className="pending-banner">
            Your business profile is under review and will not be visible to customers until approved by the admin.
          </div>
        )}

        {activeSection === "bookings" && (
          <div className="bookings-section">
            <h2>Bookings</h2>
            {bookings.length > 0 ? (
              <div className="reservation-list">
                {bookings.map((booking) => (
                  <div key={booking.id} className="reservation-ticket">
                    <p className="reservation-business-name">{booking.businessName}</p>
                    <div className="reservation-services">
                      {booking.services.map((service, index) => (
                        <p key={index} className="reservation-service-item">
                          {service.name} — {service.duration} mins — RM {service.price}
                        </p>
                      ))}
                    </div>
                    <p><label>Date:</label> {booking.date}</p>
                    <p><label>Time Slot:</label> {booking.timeSlot}</p>
                    <p><label>Total Cost:</label> RM {booking.totalCost}</p>
                    <p><label>Customer:</label> {booking.customerName}</p>
                    <p><label>Payment Status:</label> {booking.paymentStatus}</p>
                    <button
                    className="cancel-button"
                    onClick={() => openCancellationModal(booking)}
                  >
                    Cancel Reservation
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p>No bookings available.</p>
            )}
          </div>
        )}

        {activeSection === "services" && (
          <div className="services-section">
            <h2>Services</h2>
            <ul className="service-list">
              {services.map((service, index) => (
                <li key={index} className="service-item">
                  <div className="service-info">
                    <p>
                      <label>Service:</label> {service.name}
                    </p>
                    <p>
                      <label>Price:</label> RM
                      {typeof service.price === "number"
                        ? service.price.toFixed(2)
                        : parseFloat(service.price).toFixed(2)}
                    </p>
                    <p>
                      <label>Duration:</label> {service.totalDuration} minutes
                    </p>
                    <p>
                      <label>Description:</label> {" "}
                      {service.description || "No description provided"}
                    </p>
                  </div>
                  <div className="service-actions">
                    <FontAwesomeIcon
                      icon={faPen}
                      className="action-icon edit-icon"
                      onClick={() => handleEditService(service)}
                      title="Edit Service"
                    />
                    <FontAwesomeIcon
                      icon={faTrash}
                      className="action-icon delete-icon"
                      onClick={() => handleDeleteService(service)}
                      title="Delete Service"
                    />
                  </div>
                </li>
              ))}
            </ul>

            <h3 className="addServices">{editingService ? "Edit Service" : "Add New Services"}</h3>
            <form onSubmit={editingService ? handleUpdateService : handleAddService}>
              <div className="form-group">
                <label>Service Name</label>
                <input
                  className="dash-input"
                  type="text"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Service Price</label>
                <input
                  className="dash-input"
                  type="number"
                  value={newService.price}
                  onChange={(e) => setNewService({ ...newService, price: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Duration</label>
                <input
                  className="dash-input"
                  type="number"
                  value={newService.totalDuration}
                  onChange={(e) => setNewService({ ...newService, totalDuration: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div className="form-group desc-input">
                <label className="desc-label"> Service Description</label>
                <textarea
                  className="dash-input desc"
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  placeholder="Enter a brief description of the service"
                />
              </div>
              <button type="submit" className="add-service-btn">
                {editingService ? "Update Service" : "Add Service"}
              </button>
            </form>
          </div>
        )}

        {activeSection === "settings" && (
          <div className="settings-section">
            <h2>Business Information</h2>
                  {businessInfo.businessImageUrl && (
              <div className="business-image-preview">
                <img
                  src={businessInfo.businessImageUrl}
                  alt="Business"
                  className="business-image-edit"
                />
              </div>
            )}
            <input
              type="file"
              className="settings-input"
              onChange={(e) => setNewBusinessImage(e.target.files[0])}
            />
            
            <input
              type="text"
              className="settings-input"
              placeholder="Business Name"
              value={businessInfo.name}
              onChange={(e) => setBusinessInfo({ ...businessInfo, name: e.target.value })}
            />
            <input
              type="text"
              className="settings-input"
              placeholder="Address"
              value={businessInfo.address}
              onChange={(e) => setBusinessInfo({ ...businessInfo, address: e.target.value })}
            />
            <input
              type="text"
              className="settings-input"
              placeholder="Mobile Number"
              value={businessInfo.mobileNumber}
              onChange={(e) => setBusinessInfo({ ...businessInfo, mobileNumber: e.target.value })}
            />
            <textarea
              type="text"
              className="settings-input desc"
              value={businessInfo.businessDescription}
              onChange={(e) =>
                setBusinessInfo({
                  ...businessInfo,
                  businessDescription: e.target.value,
                })
              }
              placeholder="Describe your business"
            />
            <button className="save-info" onClick={handleBusinessInfoUpdate}>Save Business Info</button>
          </div>
        )}
      </div>

      <CancellationModal
        isOpen={isCancellationModalOpen}
        onClose={() => setIsCancellationModalOpen(false)}
        onSubmit={handleCancelReservation}
        selectedReason={cancellationReason}
        setSelectedReason={setCancellationReason}
        userType="serviceProvider"
      />
    </div>
  );
}

export default Dashboard;