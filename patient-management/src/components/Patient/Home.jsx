import { useState } from "react";
import PropTypes from "prop-types";
import { collection, query, where, getDocs, addDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebase-config";
import "./Home.css";

const Home = ({ user }) => {
  console.log(user);
  const [specialization, setSpecialization] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [reason, setReason] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(""); 

  const todayDate = new Date().toISOString().split("T")[0];

  const getDocsFunc = window.getDocs || getDocs;
  const getDocFunc = window.getDoc || getDoc;
  const addDocFunc = window.addDoc || addDoc;


  const handleSpecializationChange = async (e) => {
    const selectedSpecialization = e.target.value;
    setSpecialization(selectedSpecialization);

    if (selectedSpecialization) {
      try {
        const doctorsCollection = collection(db, "doctors");
        const q = query(doctorsCollection, where("specialization", "==", selectedSpecialization));
        const querySnapshot = await getDocsFunc(q);

        const fetchedDoctors = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDoctors(fetchedDoctors);
      } catch (error) {
        console.error("Error fetching doctors:", error);
        setDoctors([]);
      }
    } else {
      setDoctors([]);
    }
  };

  const handleDateChange = async (e) => {
    const date = e.target.value;
    setSelectedDate(date);

    if (new Date(date) < new Date(todayDate)) {
      setFeedbackMessage("You cannot select a date in the past.");
      setSelectedDate("");
      return;
    }

    setFeedbackMessage(""); 

    if (selectedDoctor && date) {
      try {
        const doctorDocRef = doc(db, "doctors", selectedDoctor.id);
        const doctorSnapshot = await getDocFunc(doctorDocRef);

        if (doctorSnapshot.exists()) {
          const doctorData = doctorSnapshot.data();
          const availabilityForDate = doctorData.availability.find(
            (item) => new Date(item.date).toISOString().split("T")[0] === date
          );

          if (availabilityForDate) {
            const allSlots = availabilityForDate.slots;

            const appointmentsCollection = collection(db, "appointments");
            const appointmentQuery = query(
              appointmentsCollection,
              where("doctorId", "==", selectedDoctor.id),
              where("date", "==", date)
            );
            const appointmentSnapshot = await getDocsFunc(appointmentQuery);

            const bookedSlots = appointmentSnapshot.docs.map((doc) => doc.data().time);
            const freeSlots = allSlots.filter(
              (slot) => !bookedSlots.includes(`${slot.startTime} - ${slot.endTime}`)
            );

            setAvailableSlots(freeSlots);
          } else {
            setAvailableSlots([]);
          }
        } else {
          console.error("Doctor not found.");
        }
      } catch (error) {
        console.error("Error fetching availability:", error);
      }
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedDate || new Date(selectedDate) < new Date(todayDate)) {
      setFeedbackMessage("Please select a valid date.");
      return;
    }
    if (!selectedTimeSlot) {
      setFeedbackMessage("Please select a time slot.");
      return;
    }
    if (!reason) {
      setFeedbackMessage("Please provide a reason for the appointment.");
      return;
    }

    try {
      const appointmentData = {
        date: selectedDate,
        time: selectedTimeSlot,
        patientId: user.personalId,
        doctorId: selectedDoctor.id,
        patientFirstName: user.firstName,
        patientLastName: user.lastName,
        reason,
      };

      const appointmentsCollection = collection(db, "appointments");
      const docRef = await addDocFunc(appointmentsCollection, appointmentData);

      setFeedbackMessage(`Appointment booked successfully! Appointment ID: ${docRef.id}`);
      setTimeout(() => setShowModal(false), 3000); 
      setSelectedDoctor(null);
      setSelectedDate("");
      setAvailableSlots([]);
      setSelectedTimeSlot("");
      setReason("");
    } catch (error) {
      console.error("Error booking appointment:", error);
      setFeedbackMessage("An error occurred while booking the appointment. Please try again.");
    }
  };

  return (
    <div className="home-container">
      <h1>Welcome, {user.firstName}!</h1>

      <div className="appointment-section">
        <h2>Book an Appointment</h2>

        <label htmlFor="specialization" className="home-label">Select Specialization</label>
        <select
          id="specialization"
          value={specialization}
          onChange={handleSpecializationChange}
          className="home-input"
        >
                    <option value="">--Select Specialization--</option>
          <option value="AerospaceMedicineSpecialist">Aerospace Medicine Specialist</option>
          <option value="Allergist">Allergist</option>
          <option value="Anaesthesiologist">Anaesthesiologist</option>
          <option value="Andrologist">Andrologist</option>
          <option value="Cardiologist">Cardiologist</option>
          <option value="Cardiac Electrophysiologist">Cardiac Electrophysiologist</option>
          <optgroup label="DentalCare">
            <option value="GeneralDentist">General Dentist</option>
            <option value="Pedodontist">Pedodontist</option>
            <option value="Orthodontist">Orthodontist</option>
            <option value="Periodontist">Periodontist</option>
            <option value="Endodontist">Endodontist</option>
            <option value="OralSurgeon">Oral Surgeon</option>
            <option value="Prosthodontist">Prosthodontist</option>
          </optgroup>
          <option value="Dermatologist">Dermatologist</option>
          <option value="Dietitian/Dietician">Dietitian/Dietician</option>
          <option value="EmergencyRoomDoctor">Emergency Room (ER) Doctor</option>
          <option value="Endocrinologist">Endocrinologist</option>
          <option value="Epidemiologist">Epidemiologist</option>
          <option value="Family Medicine Physician">Family Medicine Physician</option>
          <option value="Gastroenterologist">Gastroenterologist</option>
          <option value="Geriatrician">Geriatrician</option>
          <option value="Hyperbarichysician">Hyperbaric Physician</option>
          <option value="Hematologist">Hematologist</option>
          <option value="Hepatologist">Hepatologist</option>
          <option value="Immunologist">Immunologist</option>
          <option value="InfectiousDiseaseSpecialist">Infectious Disease Specialist</option>
          <option value="Intensivist">Intensivist</option>
          <option value="Neonatologist">Neonatologist</option>
          <option value="Nephrologist">Nephrologist</option>
          <option value="Neurologist">Neurologist</option>
          <option value="Neurosurgeon">Neurosurgeon</option>
          <option value="Obstetrician/Gynecologist">Obstetrician/Gynecologist</option>
          <option value="Oncologist">Oncologist</option>
          <option value="Ophthalmologist">Ophthalmologist</option>
          <option value="Orthopedist">Orthopedist</option>
          <option value="Parasitologist">Parasitologist</option>
          <option value="Pathologist">Pathologist</option>
          <option value="Pediatrician">Pediatrician</option>
          <option value="Physiatrist">Physiatrist</option>
          <option value="PlasticSurgeon">Plastic Surgeon</option>
          <option value="Psychiatrist">Psychiatrist</option>
          <option value="Pulmonologist">Pulmonologist</option>
          <option value="Radiologist">Radiologist</option>
          <option value="Urologist">Urologist</option>
          <option value="VascularSurgeon">Vascular Surgeon</option>
          <option value="Veterinarian">Veterinarian</option>
        </select>

        <div className="doctor-list">
          {doctors.map((doctor) => (
            <div className="doctor-card" key={doctor.id}>
              <h3>Dr. {doctor.name} {doctor.surname}</h3>
              <p>Email: {doctor.email}</p>
              <p>Clinic: {doctor.clinicName}</p>
              <p>Address: {doctor.clinicAddress}</p>
              <button
                className="book-appointment-button"
                onClick={() => {
                  setSelectedDoctor(doctor);
                  setShowModal(true);
                }}
              >
                Book Appointment
              </button>
            </div>
          ))}
        </div>
      </div>

      {showModal && selectedDoctor && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Book Appointment with Dr. {selectedDoctor.name}</h2>
            {feedbackMessage && <p className="feedback-message">{feedbackMessage}</p>} 
            <label htmlFor="date" className="home-label">Select Date</label>
            <input
              type="date"
              id="date"
              className="home-input"
              value={selectedDate}
              min={todayDate}
              onChange={handleDateChange}
            />
            <label htmlFor="timeSlot" className="home-label">Select Time Slot</label>
            <select
              id="timeSlot"
              className="home-input"
              value={selectedTimeSlot}
              onChange={(e) => setSelectedTimeSlot(e.target.value)}
            >
              <option value="">--Select Time Slot--</option>
              {availableSlots.map((slot, index) => (
                <option key={index} value={`${slot.startTime} - ${slot.endTime}`}>
                  {slot.startTime} - {slot.endTime}
                </option>
              ))}
            </select>
            <label htmlFor="reason" className="home-label">Reason for Appointment</label>
            <textarea
              id="reason"
              className="home-textarea"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="modal-buttons">
              <button className="modal-button" onClick={handleBookAppointment}>
                Confirm Booking
              </button>
              <button className="modal-button-cancel" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

Home.propTypes = {
  user: PropTypes.shape({
    uid: PropTypes.string.isRequired,
    personalId: PropTypes.string.isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string,
    email: PropTypes.string.isRequired,
  }).isRequired,
};

export default Home;
