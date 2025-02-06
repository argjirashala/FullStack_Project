import { useState, useEffect } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebase-config";
import PropTypes from "prop-types";
import "./Profile.css";

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

  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [errors, setErrors] = useState({ phone: "", password: "" });
  
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const doctorDocRef = doc(db, "doctors", doctorData.doctorID);
        const docSnap = await getDoc(doctorDocRef);
        if (docSnap.exists()) {
          setFormData(docSnap.data()); 
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, [doctorData.doctorID]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const phoneRegex = /^\+\d+$/; 
      if (!phoneRegex.test(value)) {
        setErrors((prevErrors) => ({ ...prevErrors, phone: "Phone must start with + and contain only numbers." }));
      } else {
        setErrors((prevErrors) => ({ ...prevErrors, phone: "" }));
      }
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSuccess("");
    setProfileError("");

    if (errors.phone) {
      setProfileError("Please fix errors before saving.");
      return;
    }

    try {
      const doctorDocRef = doc(db, "doctors", doctorData.doctorID);
      await updateDoc(doctorDocRef, { ...formData });

      setProfileSuccess("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      setProfileError("An error occurred while saving your profile.");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordSuccess("");
    setPasswordError("");

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

    if (currentPassword !== doctorData.password) {
      setPasswordError("Current password is incorrect.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (!passwordRegex.test(newPassword)) {
      setErrors((prevErrors) => ({ ...prevErrors, password: "Password must be at least 8 characters long and contain both letters and numbers." }));
      return;
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, password: "" }));
    }

    try {
      const doctorDocRef = doc(db, "doctors", doctorData.doctorID);
      await updateDoc(doctorDocRef, { password: newPassword });

      setPasswordSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      console.error("Error updating password:", error);
      setPasswordError("An error occurred while changing your password.");
    }
  };

  return (
    <div className="profile-container">
      <h1 className="profile-header">Update Your Profile</h1>

      {profileSuccess && <div className="profile-success-message">{profileSuccess}</div>}
      {profileError && <div className="profile-error-message">{profileError}</div>}

      <form className="profile-form" onSubmit={handleSaveProfile}>
        <label htmlFor="email">Email Address</label>
        <input type="email" name="email" id="email" data-testid="email" value={formData.email} onChange={handleChange} required />

        <label htmlFor="specialization">Specialization</label>
        <select name="specialization" id="specialization" data-testid="specialization" value={formData.specialization} onChange={handleChange} required>
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
        <label htmlFor="clinicAddress">Clinic Address</label>
        <input type="text" name="clinicAddress" id="clinic" data-testid="clinic" value={formData.clinicAddress} onChange={handleChange} required />

        <label htmlFor="phone">Phone Number</label>
        <input type="text" id="phone" data-testid= "phone" name="phone" value={formData.phone} onChange={handleChange} required />
        {errors.phone && <p className="profile-error-message">{errors.phone}</p>}

        <button type="submit" className="profile-save-button">Save Profile</button>
      </form>

      <hr className="divider" />

      <h2 className="profile-subheader">Change Password</h2>

      {passwordSuccess && <div className="profile-success-message">{passwordSuccess}</div>}
      {passwordError && <div className="profile-error-message">{passwordError}</div>}

      <form className="profile-form" onSubmit={handleChangePassword}>
        <label htmlFor="currentPassword">Current Password</label>
        <input id="currentPassword" data-testid="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />

        <label htmlFor="newPassword">New Password</label>
        <input id="newPassword" data-testid="new-password-input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
        {errors.password && <p className="profile-error-message">{errors.password}</p>}

        <label htmlFor="confirmNewPassword">Confirm New Password</label>
        <input id="confirmNewPassword" data-testid="confirm-new-password-input" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required />

        <button data-testid="chngpass" type="submit" className="profile-save-button">Change Password</button>
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
