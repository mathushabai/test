import React, { useState, useEffect } from "react";
import '../css/Dashboard.css'; 
import { db, auth } from "../firebase";
import { doc, collection, getDocs, updateDoc, arrayUnion } from "firebase/firestore";

function Dashboard({ onLogout }) {
  //admin view & cancellation feature // payment
  
  const [activeSection, setActiveSection] = useState("bookings");
  const [bookings, setBookings] = useState([]); 
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({ name: "", price: "" }); 

  useEffect(() => {
    const fetchBookings = async () => {
      const bookingCollection = collection(db, "bookings"); 
      const bookingSnapshot = await getDocs(bookingCollection);
      const bookingList = bookingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBookings(bookingList);
    };

    fetchBookings();
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      const serviceCollection = collection(db, "services"); 
      const serviceSnapshot = await getDocs(serviceCollection);
      const serviceList = serviceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setServices(serviceList);
    };

    fetchServices();
  }, []);

  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;

      if (!user) {
        console.error("No authenticated user");
        return;
      }
      const uid = user.uid;
      const serviceProviderDoc = doc(db, "serviceProviders", uid);
      
      // Add new service to the services subcollection
      await updateDoc(serviceProviderDoc, {
        services: arrayUnion({
          name: newService.name,
          price: newService.price,
          duration: newService.duration,
        })
      });

      setServices([...services, { name: newService.name, price: newService.price, duration: newService.duration  }]);
      setNewService({ name: "", price: "", duration: "" }); // Reset form fields
    } catch (error) {
      console.error("Error adding service: ", error);
    }
  };


  return (
    <div className="dashboard-container">
      {/* Sidebar */}
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
            Settings
          </li>
          <li onClick={onLogout} className="logout">
            Logout
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <div className="main-content">
        {/* View Bookings Section */}
        {activeSection === "bookings" && (
          <div className="bookings-section">
            <h2>Bookings</h2>
            {bookings.length > 0 ? (
              <ul className="booking-list">
                {bookings.map((booking) => (
                  <li key={booking.id}>
                    <p>Service: {booking.service}</p>
                    <p>Date: {booking.date}</p>
                    <p>Time: {booking.time}</p>
                    <p>Customer: {booking.customerName}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No bookings available.</p>
            )}
          </div>
        )}

        {/* Manage Services Section */}
        {activeSection === "services" && (
          <div className="services-section">
            <h2>Services</h2>
            <ul className="service-list">
              {services.map((service) => (
                <li key={service.id}>
                  <p>{service.name} - ${service.price}</p>
                </li>
              ))}
            </ul>

          {/* Add New Service */}
          <h3>Add New Service</h3>
          <form onSubmit={handleAddService}>
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
                onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Duration</label>
              <input
                className="dash-input"
                type="text"
                value={newService.duration}
                placeholder="Enter duration (e.g., 1h 30min)"
                onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="add-service-btn">Add Service</button>
          </form>
        </div>
        )}

        {/* Settings Section */}
        {activeSection === "settings" && (
          <div className="settings-section">
            <h2>Settings</h2>
            <p>Settings section coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;