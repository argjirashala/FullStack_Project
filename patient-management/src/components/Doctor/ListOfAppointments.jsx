import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase-config";
import axios from "axios";
import "./ListOfAppointments.css";
import { getEnvVar } from "../../config/env";

const ListOfAppointments = ({ doctorData }) => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [searchCriteria, setSearchCriteria] = useState({
    firstName: "",
    lastName: "",
    personalId: "",
    appointmentDate: "",
  });
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [therapy, setTherapy] = useState("");
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const cloudinaryConfig = {
    cloudName: getEnvVar("VITE_APP_CLOUDINARY_CLOUD_NAME"),
    uploadPreset: getEnvVar("VITE_APP_CLOUDINARY_UPLOAD_PRESET"),
    imageUploadUrl: getEnvVar("VITE_APP_CLOUDINARY_IMAGE_UPLOAD_URL"),
    rawUploadUrl: getEnvVar("VITE_APP_CLOUDINARY_RAW_UPLOAD_URL"),
  };

  useEffect(() => {
    const fetchFinishedAppointments = async () => {
      try {
        const appointmentsCollection = collection(db, "appointments");
        const q = query(appointmentsCollection, where("doctorId", "==", doctorData.doctorID));
        const querySnapshot = await getDocs(q);

        const finishedAppointments = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((appointment) => appointment.diagnosis && appointment.therapy);

        setAppointments(finishedAppointments);
        setFilteredAppointments(finishedAppointments);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };

    fetchFinishedAppointments();
  }, [doctorData.doctorID]);

  const handleSearch = () => {
    const { firstName, lastName, personalId, appointmentDate } = searchCriteria;

    const filtered = appointments.filter((appointment) => {
      return (
        (!firstName || appointment.patientFirstName.toLowerCase().includes(firstName.toLowerCase())) &&
        (!lastName || appointment.patientLastName.toLowerCase().includes(lastName.toLowerCase())) &&
        (!personalId || appointment.patientId === personalId) &&
        (!appointmentDate || appointment.date === appointmentDate)
      );
    });

    setFilteredAppointments(filtered);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const uploadFileToCloudinary = async () => {
    if (!file) return null;  
  
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", cloudinaryConfig.uploadPreset); 
    formData.append("cloud_name", cloudinaryConfig.cloudName);
  
    try {
      const uploadEndpoint =
        file.type === "application/pdf"
          ? cloudinaryConfig.rawUploadUrl
          : cloudinaryConfig.imageUploadUrl;
  
      const response = await axios.post(uploadEndpoint, formData);
      return response.data.secure_url; 
    } catch (error) {
      console.error("Error uploading file to Cloudinary:", error);
      alert("File upload failed.");
      return null;
    }
  };
  
  const handleEditDiagnosisAndTherapy = async () => {
    if (!diagnosis.trim() || !therapy.trim()) {
      setErrorMessage("Diagnosis and therapy cannot be empty.");
      setSuccessMessage("");
      return;
    }
  
    try {
      const newFileUrl = file ? await uploadFileToCloudinary() : fileUrl;
  
      const appointmentDocRef = doc(db, "appointments", selectedAppointment);
      await updateDoc(appointmentDocRef, {
        diagnosis,
        therapy,
        fileUrl: newFileUrl,
        fileType: file ? file.type : fileUrl ? "existing" : null,
      });
  
      setSuccessMessage("Diagnosis, therapy, and/or file updated successfully!");
      setErrorMessage("");
  
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment.id === selectedAppointment
            ? { ...appointment, diagnosis, therapy, fileUrl: newFileUrl, fileType: file?.type || null }
            : appointment
        )
      );
  
      setFilteredAppointments((prevFiltered) =>
        prevFiltered.map((appointment) =>
          appointment.id === selectedAppointment
            ? { ...appointment, diagnosis, therapy, fileUrl: newFileUrl, fileType: file?.type || null }
            : appointment
        )
      );
  
      setSelectedAppointment(null);
      setDiagnosis("");
      setTherapy("");
      setFile(null);
      setFileUrl(newFileUrl);
  
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (error) {
      console.error("Error updating diagnosis and therapy:", error);
      setErrorMessage("An error occurred while updating the diagnosis, therapy, or file.");
      setSuccessMessage("");
    }
  };
  
  
  const handleDownloadFile = async (fileUrl, fileType) => {
    try {
      const response = await axios.get(fileUrl, {
        responseType: "blob", 
      });
  
      const url = window.URL.createObjectURL(new Blob([response.data]));

      const fileExtension = fileType?.split("/")[1] || "file";
  
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `download.${fileExtension}`);
      document.body.appendChild(link);
      link.click();
  
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("An error occurred while downloading the file.");
    }
  };


  const openModal = (appointment) => {
    setSelectedAppointment(appointment.id);
    setDiagnosis(appointment.diagnosis);
    setTherapy(appointment.therapy);
    setFile(null);
  };
  
  return (
    <div className="list-appointments-container">
      <h1 className="list-appointments-header">List of Appointments for Dr. {doctorData?.surname}</h1>

      <div className="list-search-section">
        <input type="text" placeholder="First Name" value={searchCriteria.firstName} onChange={(e) => setSearchCriteria({ ...searchCriteria, firstName: e.target.value })} />
        <input type="text" placeholder="Last Name" value={searchCriteria.lastName} onChange={(e) => setSearchCriteria({ ...searchCriteria, lastName: e.target.value })} />
        <input type="text" placeholder="Personal ID" value={searchCriteria.personalId} onChange={(e) => setSearchCriteria({ ...searchCriteria, personalId: e.target.value })} />
        <input type="date" value={searchCriteria.appointmentDate} onChange={(e) => setSearchCriteria({ ...searchCriteria, appointmentDate: e.target.value })} />
        <button className="list-search-button" onClick={handleSearch}>Search</button>
      </div>

      {successMessage && <div className="list-success-message">{successMessage}</div>}
      <table className="list-appointments-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Patient</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredAppointments.map((appointment) => (
            <tr key={appointment.id}>
              <td>{appointment.date}</td>
              <td>{appointment.time}</td>
              <td>{appointment.patientFirstName} {appointment.patientLastName}</td>
              <td>
                {appointment.fileUrl && (
                  <button className="download-button" onClick={() => handleDownloadFile(appointment.fileUrl, appointment.fileType)}>Download File</button>
                )}
                <button className="list-edit-button" onClick={() => openModal(appointment)}>View/Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedAppointment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Edit Diagnosis and Therapy</h2>
            {errorMessage && <div className="list-error-message">{errorMessage}</div>}
            <label htmlFor="diagnosis">Diagnosis:</label>
            <textarea id="diagnosis" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
            <label htmlFor="therapy">Therapy:</label>
            <textarea id="therapy" value={therapy} onChange={(e) => setTherapy(e.target.value)} />
            <label>Upload File:</label>
            <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileChange} />
            <div className="modal-buttons">
            <button className="save-button" onClick={handleEditDiagnosisAndTherapy}>Save</button>
              <button className="cancel-button" onClick={() => setSelectedAppointment(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ListOfAppointments.propTypes = {
  doctorData: PropTypes.shape({
    name: PropTypes.string.isRequired,
    doctorID: PropTypes.string.isRequired,
    surname: PropTypes.string.isRequired
  }).isRequired,
};

export default ListOfAppointments;
