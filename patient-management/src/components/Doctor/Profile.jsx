import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase-config"; 
import PropTypes from "prop-types";

const Profile = ({ doctorData }) => {
  const [formData, setFormData] = useState({
    email: doctorData.email || "",
    specialization: doctorData.specialization || "",
    clinicName: doctorData.clinicName || "",
    clinicAddress: doctorData.clinicAddress || "",
    phone: doctorData.phone || "",
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    try {
      const doctorDocRef = doc(db, "doctors", doctorData.doctorID);

      await updateDoc(doctorDocRef, {
        email: formData.email,
        specialization: formData.specialization,
        clinicName: formData.clinicName,
        clinicAddress: formData.clinicAddress,
        phone: formData.phone,
      });

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred while saving your profile.");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (currentPassword !== doctorData.password) {
      alert("Current password is incorrect.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      alert("New passwords do not match.");
      return;
    }

    try {
      const doctorDocRef = doc(db, "doctors", doctorData.doctorID);

      await updateDoc(doctorDocRef, {
        password: newPassword,
      });

      alert("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      console.error("Error updating password:", error);
      alert("An error occurred while changing your password.");
    }
  };

  return (
    <div>
      <h1>Update Your Profile</h1>
      <form onSubmit={handleSaveProfile}>
        <label>Email Address</label>
        <br />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <br />
        <br />

        <label>Specialization</label>
        <br />
        <select
          name="specialization"
          value={formData.specialization}
          onChange={handleChange}
          required
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
        <br />
        <br />

        <label>Clinic Address</label>
        <br />
        <input
          type="text"
          name="clinicAddress"
          value={formData.clinicAddress}
          onChange={handleChange}
          required
        />
        <br />
        <br />

        <label>Phone Number</label>
        <br />
        <input
          type="number"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        <br />
        <br />

        <button type="submit">Save Profile</button>
      </form>

      <hr />

      <h2>Change Password</h2>
      <form onSubmit={handleChangePassword}>
        <label>Current Password</label>
        <br />
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
        <br />
        <br />

        <label>New Password</label>
        <br />
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <br />
        <br />

        <label>Confirm New Password</label>
        <br />
        <input
          type="password"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          required
        />
        <br />
        <br />

        <button type="submit">Change Password</button>
      </form>
    </div>
  );
};

Profile.propTypes = {
  doctorData: PropTypes.shape({
    doctorID: PropTypes.string.isRequired,
    email: PropTypes.string,
    specialization: PropTypes.string,
    clinicName: PropTypes.string,
    clinicAddress: PropTypes.string,
    phone: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    password: PropTypes.string.isRequired,
  }).isRequired,
};

export default Profile;