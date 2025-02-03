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
        <label>Email Address</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} required />

        <label>Specialization</label>
        <select name="specialization" value={formData.specialization} onChange={handleChange} required>
          <option value="">--Select Specialization--</option>
          <option value="Cardiologist">Cardiologist</option>
          <option value="Dermatologist">Dermatologist</option>
          <option value="Neurologist">Neurologist</option>
          <option value="Pediatrician">Pediatrician</option>
          <option value="Psychiatrist">Psychiatrist</option>
          <option value="Radiologist">Radiologist</option>
        </select>

        <label>Clinic Address</label>
        <input type="text" name="clinicAddress" value={formData.clinicAddress} onChange={handleChange} required />

        <label>Phone Number</label>
        <input type="text" name="phone" value={formData.phone} onChange={handleChange} required />
        {errors.phone && <p className="profile-error-message">{errors.phone}</p>}

        <button type="submit" className="profile-save-button">Save Profile</button>
      </form>

      <hr className="divider" />

      <h2 className="profile-subheader">Change Password</h2>

      {passwordSuccess && <div className="profile-success-message">{passwordSuccess}</div>}
      {passwordError && <div className="profile-error-message">{passwordError}</div>}

      <form className="profile-form" onSubmit={handleChangePassword}>
        <label>Current Password</label>
        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />

        <label>New Password</label>
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
        {errors.password && <p className="profile-error-message">{errors.password}</p>}

        <label>Confirm New Password</label>
        <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required />

        <button type="submit" className="profile-save-button">Change Password</button>
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
