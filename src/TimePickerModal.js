import React, { useState } from "react";
import './TimePickerModal.css'; 
import { TimePicker } from '@vaadin/react-components/TimePicker.js';
import { Checkbox } from '@vaadin/react-components/Checkbox.js';

const TimePickerModal = ({ day, onSave, onCancel }) => {
  const [startTime, setStartTime] = useState("9:00");
  const [endTime, setEndTime] = useState("17:00");
  const [isClosed, setIsClosed] = useState(false);

  const handleSave = () => {
    onSave(day, { start: startTime, end: endTime, closed: isClosed });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{`Set Hours for ${day}`}</h3>
        <div className="closed-checkbox">
          <label>
            <Checkbox
              checked={isClosed} 
              onChange={(e) => setIsClosed(e.target.checked)} 
            />
            Closed for the Day
          </label>
        </div>

        {!isClosed && (
          <div className="time-picker-fields">
            <label className="timelbl">Opening Time
            <TimePicker
              value={startTime}
              step={60 * 15}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </label>
            <label className="timelbl">Closing Time
            <TimePicker
              type="time"
              value={endTime}
              step={60 * 15}
              onChange={(e) => setEndTime(e.target.value)}
            />
            </label>
          </div>
        )}
        <div className="modal-actions">
          <button className="cancelBtn" onClick={onCancel}>Cancel</button>
          <button className="saveBtn" onClick={() => { 
              if (!isClosed && (!startTime || !endTime)) { //to ensure both inputs are required
                alert("Please select both start and end times.");
                return;
              }
              handleSave();
            }}>Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimePickerModal;