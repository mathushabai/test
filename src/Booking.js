import React, { useState } from "react";

function Booking() {

  const [booking, setBooking] = useState({
    service: "",
    date: "",
    time: ""
  });

  const handleChange = (e) => {
    setBooking({
      ...booking,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Booking Details: ", booking);
  };

  return (
    <div className="form-container">
      <h2>Book a Service</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Service</label>
          <input
            type="text"
            name="service"
            value={booking.service}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            name="date"
            value={booking.date}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Time</label>
          <input
            type="time"
            name="time"
            value={booking.time}
            onChange={handleChange}
          />
        </div>
        <button className="submit-btn" type="submit">
          Book
        </button>
      </form>
    </div>
  );
}

export default Booking;