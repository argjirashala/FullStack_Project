import { useState } from "react";
import PropTypes from "prop-types";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase-config"; 

const Home = ({ user }) => {
  const [specialization, setSpecialization] = useState("");
  const [doctors, setDoctors] = useState([]); 

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
            <select id="doctors" required>
              <option value="">--Select Doctor--</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name} {doctor.surname} ({doctor.specialization})
                </option>
              ))}
            </select>
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
