import { useState } from "react";
import PropTypes from "prop-types";
import { collection, query, where, getDocs, addDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase-config";

const Home = ({ user }) => {
  const [specialization, setSpecialization] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [reason, setReason] = useState("");

  const handleSpecializationChange = async (e) => {
    const selectedSpecialization = e.target.value;
    setSpecialization(selectedSpecialization);

    if (selectedSpecialization) {
      try {
        const doctorsCollection = collection(db, "doctors");
        const q = query(
          doctorsCollection,
          where("specialization", "==", selectedSpecialization)
        );
        const querySnapshot = await getDocs(q);

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

  const handleDoctorChange = (e) => {
    setSelectedDoctor(e.target.value);
    setSelectedDate(""); 
    setAvailableSlots([]);
    setSelectedTimeSlot("");
  };

  const handleDateChange = async (e) => {
    const selectedDate = e.target.value;
    setSelectedDate(selectedDate);

    if (selectedDoctor && selectedDate) {
      try {
        const doctorDocRef = doc(db, "doctors", selectedDoctor);
        const doctorSnapshot = await getDoc(doctorDocRef);

        if (doctorSnapshot.exists()) {
          const doctorData = doctorSnapshot.data();

          const availabilityForDate = doctorData.availability.find(
            (item) => item.date === selectedDate
          );

          if (availabilityForDate) {
            const allSlots = availabilityForDate.slots;

            const appointmentsCollection = collection(db, "appointments");
            const appointmentQuery = query(
              appointmentsCollection,
              where("doctorId", "==", selectedDoctor),
              where("date", "==", selectedDate)
            );
            const appointmentSnapshot = await getDocs(appointmentQuery);

            const bookedSlots = appointmentSnapshot.docs.map(
              (doc) => doc.data().time
            );

            const freeSlots = allSlots.filter(
              (slot) => !bookedSlots.includes(`${slot.startTime} - ${slot.endTime}`)
            );

            setAvailableSlots(freeSlots);
          } else {
            setAvailableSlots([]); 
          }
        } else {
          console.error("Doctor not found");
        }
      } catch (error) {
        console.error("Error fetching availability:", error);
      }
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedTimeSlot || !reason) {
      alert("Please select a time slot and enter the reason for the appointment.");
      return;
    }

    try {
      const appointmentData = {
        date: selectedDate,
        time: selectedTimeSlot,
        patientId: user.personalId,
        doctorId: selectedDoctor,
        patientFirstName: user.firstName,
        patientLastName: user.lastName,
        reason,
      };

      const appointmentsCollection = collection(db, "appointments");
      const docRef = await addDoc(appointmentsCollection, appointmentData);

      alert(`Appointment booked successfully! Appointment ID: ${docRef.id}`);
      setSelectedDoctor("");
      setSelectedDate("");
      setAvailableSlots([]);
      setSelectedTimeSlot("");
      setReason("");
    } catch (error) {
      console.error("Error booking appointment:", error);
      alert("An error occurred while booking the appointment. Please try again.");
    }
  };

  return (
    <div>
      <h1>Welcome, {user.firstName}!</h1>
      <p>Your Personal ID: {user.personalId}</p>
      <p>Your Email: {user.email}</p>

      <div>
        <h2>Book an Appointment</h2>
        <label htmlFor="specialization">Select Specialization</label>
        <br />
        <select
          id="specialization"
          value={specialization}
          onChange={handleSpecializationChange}
          required
        >
          <option value="">--Select Specialization--</option>
          <option value="AerospaceMedicineSpecialist">
            Aerospace Medicine Specialist
          </option>
          <option value="Allergist">Allergist</option>
          <option value="Anaesthesiologist">Anaesthesiologist</option>
          <option value="Andrologist">Andrologist</option>
          <option value="Cardiologist">Cardiologist</option>
          <option value="Cardiac Electrophysiologist">
            Cardiac Electrophysiologist
          </option>
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
          <option value="EmergencyRoomDoctor">
            Emergency Room (ER) Doctor
          </option>
          <option value="Endocrinologist">Endocrinologist</option>
          <option value="Epidemiologist">Epidemiologist</option>
          <option value="Family Medicine Physician">
            Family Medicine Physician
          </option>
          <option value="Gastroenterologist">Gastroenterologist</option>
          <option value="Geriatrician">Geriatrician</option>
          <option value="Hyperbarichysician">Hyperbaric Physician</option>
          <option value="Hematologist">Hematologist</option>
          <option value="Hepatologist">Hepatologist</option>
          <option value="Immunologist">Immunologist</option>
          <option value="InfectiousDiseaseSpecialist">
            Infectious Disease Specialist
          </option>
          <option value="Intensivist">Intensivist</option>
          <option value="Neonatologist">Neonatologist</option>
          <option value="Nephrologist">Nephrologist</option>
          <option value="Neurologist">Neurologist</option>
          <option value="Neurosurgeon">Neurosurgeon</option>
          <option value="Obstetrician/Gynecologist">
            Obstetrician/Gynecologist
          </option>
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

        <br />
        <br />

        {specialization && (
          <div>
            <label htmlFor="doctors">Select Doctor</label>
            <br />
            <select
              id="doctors"
              value={selectedDoctor}
              onChange={handleDoctorChange}
              required
            >
              <option value="">--Select Doctor--</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name} {doctor.surname} ({doctor.specialization})
                </option>
              ))}
            </select>
          </div>
        )}
        <br />

        {selectedDoctor && (
          <div>
            <label htmlFor="date">Select Date</label>
            <br />
            <input type="date" id="date" value={selectedDate} onChange={handleDateChange} />
          </div>
        )}
        <br />

        {selectedDate && availableSlots.length > 0 && (
          <div>
            <label htmlFor="timeSlot">Select Time Slot</label>
            <br />
            <select
              id="timeSlot"
              value={selectedTimeSlot}
              onChange={(e) => setSelectedTimeSlot(e.target.value)}
              required
            >
              <option value="">--Select Time Slot--</option>
              {availableSlots.map((slot, index) => (
                <option key={index} value={`${slot.startTime} - ${slot.endTime}`}>
                  {slot.startTime} - {slot.endTime}
                </option>
              ))}
            </select>
          </div>
        )}
        <br />

        {selectedDate && selectedTimeSlot && (
          <div>
            <label htmlFor="reason">Reason for Appointment</label>
            <br />
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
            <br />
            <br />
            <button onClick={handleBookAppointment}>Book Appointment</button>
          </div>
        )}
      </div>
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
