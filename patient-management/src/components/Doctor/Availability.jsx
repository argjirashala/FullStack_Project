import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase-config";

const SetAvailability = ({ doctorData }) => {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [availability, setAvailability] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);

  useEffect(() => {
    const fetchAvailabilityAndBookedSlots = async () => {
      if (!doctorData?.doctorID) return; 
  
      try {
        const doctorDocRef = doc(db, "doctors", doctorData.doctorID);
        const doctorSnapshot = await getDoc(doctorDocRef);
  
        if (doctorSnapshot.exists()) {
          const data = doctorSnapshot.data();
          setAvailability(data.availability || []);
        }
  
        const appointmentsCollection = collection(db, "appointments");
        const q = query(appointmentsCollection, where("doctorId", "==", doctorData.doctorID));
        const querySnapshot = await getDocs(q);
  
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
  }, [doctorData?.doctorID]);
  

  const isSlotBooked = (date, startTime, endTime) => {
    return bookedSlots.some(
      (slot) => slot.date === date && slot.time === `${startTime} - ${endTime}`
    );
  };

  const handleAddTimeSlot = async () => {
    if (!date || !startTime || !endTime) {
      alert("Please fill in all fields before adding a time slot.");
      return;
    }
    if (startTime >= endTime) {
      alert("Start time must be before end time.");
      return;
    }

    const newSlot = { startTime, endTime };
    const updatedAvailability = [...availability];

    const dateIndex = updatedAvailability.findIndex((item) => item.date === date);
    if (dateIndex >= 0) {
      updatedAvailability[dateIndex].slots.push(newSlot);
    } else {
      updatedAvailability.push({ date, slots: [newSlot] });
    }

    try {
      const doctorDocRef = doc(db, "doctors", doctorData.doctorID);
      await updateDoc(doctorDocRef, { availability: updatedAvailability });

      alert("Time slot added successfully!");
      setAvailability(updatedAvailability);
      setStartTime("");
      setEndTime("");
    } catch (error) {
      console.error("Error adding time slot:", error);
      alert("An error occurred while adding the time slot.");
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
      await updateDoc(doctorDocRef, { availability: updatedAvailability });

      alert("Time slot removed successfully!");
      setAvailability(updatedAvailability);
    } catch (error) {
      console.error("Error removing time slot:", error);
      alert("An error occurred while removing the time slot.");
    }
  };

  return (
    <div>
      <h1>Set Availability for Dr. {doctorData?.name}</h1>
      <p>Here, you can set your working hours and availability.</p>

      <div>
        <label>Date</label>
        <br />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <br />
        <br />

        <label>Start Time</label>
        <br />
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />
        <br />
        <br />

        <label>End Time</label>
        <br />
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required
        />
        <br />
        <br />

        <button onClick={handleAddTimeSlot}>Add Time Slot</button>
        <br />
        <br />

        <h2>Availability</h2>
        <ul>
          {availability.map((item, dateIndex) => (
            <li key={dateIndex}>
              <strong>{item.date}</strong>
              <ul>
                {item.slots.map((slot, slotIndex) => (
                  <li key={slotIndex}>
                    {slot.startTime} - {slot.endTime}{" "}
                    {isSlotBooked(item.date, slot.startTime, slot.endTime) ? (
                      <span style={{ color: "red", marginLeft: "10px" }}>
                        (Booked)
                      </span>
                    ) : (
                      <button
                        onClick={() => handleRemoveTimeSlot(item.date, slotIndex)}
                        style={{ marginLeft: "10px" }}
                      >
                        Remove
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

SetAvailability.propTypes = {
  doctorData: PropTypes.shape({
    name: PropTypes.string.isRequired,
    doctorID: PropTypes.string.isRequired,
  }).isRequired,
};

export default SetAvailability;
