function CancellationModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  selectedReason, 
  setSelectedReason, 
  userType 
}) {
  if (!isOpen) return null;

  const reasonsForCustomer = [
    "Unable to make it on time",
    "Change of plans",
    "Emergency situation",
    "Other",
  ];

  const reasonsForServiceProvider = [
    "Overbooked Time Slot",
    "Unable to provide service",
    "Emergency situation",
    "Other",
  ];

  const reasons = userType === "customer" ? reasonsForCustomer : reasonsForServiceProvider;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Cancel Reservation</h2>
        <p>Why are you canceling this reservation?</p>
        <select
          value={selectedReason}
          onChange={(e) => setSelectedReason(e.target.value)}
        >
          <option value="">Select a reason</option>
          {reasons.map((reason, index) => (
            <option key={index} value={reason}>
              {reason}
            </option>
          ))}
        </select>
        <div className="modal-actions">
          <button className="modal-close" onClick={onClose}>
            Close
          </button>
          <button
            className="modal-confirm"
            onClick={() => {
              if (selectedReason) onSubmit();
              else alert("Please select a reason.");
            }}
          >
            Confirm Cancellation
          </button>
        </div>
      </div>
    </div>
  );
}

export default CancellationModal;