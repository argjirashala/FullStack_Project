import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import "./Availability.css";
import { db } from "../../config/firebase-config";

const SetAvailability = ({ doctorData }) => {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [availability, setAvailability] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const getDocFunc = window.getDoc || getDoc;
  const getDocsFunc = window.getDocs || getDocs;
  const updateDocFunc = window.updateDoc || updateDoc;

  useEffect(() => {
    const fetchAvailabilityAndBookedSlots = async () => {
      if (!doctorData?.doctorID) return;

      try {
        const doctorDocRef = doc(db, "doctors", doctorData.doctorID);
        const doctorSnapshot = await getDocFunc(doctorDocRef);

        if (doctorSnapshot.exists()) {
          const data = doctorSnapshot.data();
          const today = new Date().toISOString().split("T")[0];
          setAvailability(
            (data.availability || []).filter((item) => item.date >= today)
          );
        }

        const appointmentsCollection = collection(db, "appointments");
        const q = query(
          appointmentsCollection,
          where("doctorId", "==", doctorData.doctorID)
        );
        const querySnapshot = await getDocsFunc(q);

        const booked = querySnapshot.docs.map((doc) => ({
          date: doc.data().date,
          time: doc.data().time,
        }));

        setBookedSlots(booked);
      } catch (error) {
        console.error("Error fetching availability or booked slots:", error);
      }
    };

    fetchAvailabilityAndBookedSlots();
  }, [doctorData?.doctorID, getDocFunc, getDocsFunc]);

  const isSlotBooked = (date, startTime, endTime) => {
    return bookedSlots.some(
      (slot) => slot.date === date && slot.time === `${startTime} - ${endTime}`
    );
  };

  const handleAddTimeSlot = async () => {
    if (!date || !startTime || !endTime) {
      setError("All fields are required.");
      return;
    }
    if (startTime >= endTime) {
      setError("Start time must be before end time.");
      return;
    }

    setError("");
    const newSlot = { startTime, endTime };
    const updatedAvailability = [...availability];
    const dateIndex = updatedAvailability.findIndex(
      (item) => item.date === date
    );

    if (dateIndex >= 0) {
      updatedAvailability[dateIndex].slots.push(newSlot);
    } else {
      updatedAvailability.push({ date, slots: [newSlot] });
    }

    try {
      const doctorDocRef = doc(db, "doctors", doctorData.doctorID);
      await updateDocFunc(doctorDocRef, { availability: updatedAvailability });

      setAvailability(updatedAvailability);
      setDate("");
      setStartTime("");
      setEndTime("");

      setSuccessMessage("Time slot added successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error adding time slot:", error);
    }
  };

  const handleRemoveTimeSlot = async (dateToRemove, slotIndex) => {
    const updatedAvailability = availability
      .map((item) =>
        item.date === dateToRemove
          ? { ...item, slots: item.slots.filter((_, i) => i !== slotIndex) }
          : item
      )
      .filter((item) => item.slots.length > 0);

    try {
      const doctorDocRef = doc(db, "doctors", doctorData.doctorID);
      await updateDocFunc(doctorDocRef, { availability: updatedAvailability });

      setAvailability(updatedAvailability);
    } catch (error) {
      console.error("Error removing time slot:", error);
    }
  };

  return (
    <div className="availability-container">
      <h1 className="availability-header">
        Set Availability for Dr. {doctorData?.surname}
      </h1>
      <p className="availability-description">
        Manage your working hours and set availability slots for appointments.
      </p>

      <div className="form-section">
        <label htmlFor="date" className="form-label">
          Date
        </label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="form-input"
        />

        <label htmlFor="startTime" className="form-label">
          Start Time
        </label>
        <input
          type="time"
          id="startTime"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="form-input"
        />

        <label htmlFor="endTime" className="form-label">
          End Time
        </label>
        <input
          type="time"
          id="endTime"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="form-input"
        />

        {error && <p className="form-error">{error}</p>}
        {successMessage && <p className="form-success">{successMessage}</p>}

        <button onClick={handleAddTimeSlot} className="add-button">
          Add Time Slot
        </button>
      </div>

      <h2 className="availability-section-title">Availability</h2>
      <ul className="availability-list">
        {availability
          .filter((item) => item.date >= new Date().toISOString().split("T")[0])
          .map((item, dateIndex) => (
            <li key={dateIndex} className="availability-item">
              <strong>{item.date}</strong>

              <ul className="slots-list">
                {item.slots
                  .filter(
                    (slot) =>
                      !isSlotBooked(item.date, slot.startTime, slot.endTime)
                  )
                  .map((slot, slotIndex) => (
                    <li key={slotIndex} className="slot-item">
                      {slot.startTime} - {slot.endTime}
                      <button
                        onClick={() =>
                          handleRemoveTimeSlot(item.date, slotIndex)
                        }
                        className="remove-button"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
              </ul>
            </li>
          ))}
      </ul>
    </div>
  );
};

SetAvailability.propTypes = {
  doctorData: PropTypes.shape({
    name: PropTypes.string.isRequired,
    doctorID: PropTypes.string.isRequired,
    surname: PropTypes.string.isRequired
  }).isRequired,
};

export default SetAvailability;
