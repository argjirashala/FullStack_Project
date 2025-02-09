import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase-config";
import axios from "axios";
import "./Home.css";
import { getEnvVar } from "../../config/env";

const Home = ({ doctorData }) => {
  const [todaysAppointments, setTodaysAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [therapy, setTherapy] = useState("");
  const [file, setFile] = useState(null);
  const [_fileUrl, setFileUrl] = useState(null);
  const [error, setError] = useState({ diagnosis: "", therapy: "" });

  const cloudinaryConfig = {
    cloudName: getEnvVar("VITE_APP_CLOUDINARY_CLOUD_NAME"),
    uploadPreset: getEnvVar("VITE_APP_CLOUDINARY_UPLOAD_PRESET"),
    imageUploadUrl: getEnvVar("VITE_APP_CLOUDINARY_IMAGE_UPLOAD_URL"),
    rawUploadUrl: getEnvVar("VITE_APP_CLOUDINARY_RAW_UPLOAD_URL"),
  };
  
  useEffect(() => {
    const fetchTodaysAppointments = async () => {
      if (!doctorData?.doctorID) return;

      try {
        const appointmentsCollection = collection(db, "appointments");
        const q = query(appointmentsCollection, where("doctorId", "==", doctorData.doctorID));
        const querySnapshot = await getDocs(q);

        const fetchedAppointments = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const today = new Date().toISOString().split("T")[0];
        const filteredAppointments = fetchedAppointments.filter(
          (appointment) => appointment.date === today
        );

        setTodaysAppointments(filteredAppointments);
      } catch (error) {
        console.error("Error fetching today's appointments:", error);
      }
    };

    fetchTodaysAppointments();
  }, [doctorData?.doctorID]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSaveDiagnosisAndTherapy = async (appointmentId) => {
    const hasError = validateInputs();
    if (hasError) return;

    try {
      const newFileUrl = file ? await uploadFileToCloudinary() : null;

      const appointmentDocRef = doc(db, "appointments", appointmentId);
      await updateDoc(appointmentDocRef, {
        diagnosis,
        therapy,
        fileUrl: newFileUrl,
        fileType: file ? file.type : null,
      });

      setTodaysAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment.id === appointmentId
            ? { ...appointment, diagnosis, therapy, fileUrl: newFileUrl, fileType: file?.type || null }
            : appointment
        )
      );

      setSelectedAppointment(null);
      setDiagnosis("");
      setTherapy("");
      setFile(null);
      setFileUrl(null);
      setError({ diagnosis: "", therapy: "" });
    } catch (error) {
      console.error("Error saving diagnosis and therapy:", error);
    }
  };

  const validateInputs = () => {
    let hasError = false;
    const newError = { diagnosis: "", therapy: "" };

    if (!diagnosis.trim()) {
      newError.diagnosis = "Diagnosis is required.";
      hasError = true;
    }

    if (!therapy.trim()) {
      newError.therapy = "Therapy is required.";
      hasError = true;
    }

    setError(newError);
    return hasError;
  };

  const uploadFileToCloudinary = async () => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", cloudinaryConfig.uploadPreset);
    formData.append("cloud_name", cloudinaryConfig.cloudName);

    try {
      const uploadEndpoint = file.type === "application/pdf"
        ? cloudinaryConfig.rawUploadUrl
        : cloudinaryConfig.imageUploadUrl;

      const response = await axios.post(uploadEndpoint, formData);
      return response.data.secure_url;
    } catch (error) {
      console.error("Error uploading file to Cloudinary:", error);
      return null;
    }
  };

  const handleOpenModal = (appointment) => {
    setSelectedAppointment(appointment);
    setDiagnosis(appointment.diagnosis || "");
    setTherapy(appointment.therapy || "");
    setFileUrl(appointment.fileUrl || null);
    setFile(null);
  };

  const handleDownloadFile = async (fileUrl, fileType) => {
    try {
      const response = await axios.get(fileUrl, { responseType: "blob" });

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

  return (
    <div className="doctor-home-container">
      <h1 className="doctor-home-header">Welcome, Dr. {doctorData?.surname}!</h1>

      <h2 className="home-appointments-section-title">Today&apos;s Appointments</h2>
      {todaysAppointments.length > 0 ? (
        <ul className="home-appointments-list">
          {todaysAppointments.map((appointment) => (
            <li key={appointment.id} className="home-appointment-item">
              <strong>{appointment.time}</strong>
              <p>
                Patient: {appointment.patientFirstName} {appointment.patientLastName}
              </p>
              <p>Reason: {appointment.reason}</p>
              <button
                className="home-appointment-button"
                onClick={() => handleOpenModal(appointment)}
              >
                {appointment.diagnosis && appointment.therapy
                  ? "View Diagnosis and Therapy"
                  : "Add Diagnosis and Therapy"}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="home-no-appointments-message">No appointments for today.</p>
      )}

      {selectedAppointment && (
        <div className="home-modal-overlay">
          <div className="home-modal-content">
            <h2>{selectedAppointment.diagnosis ? "Diagnosis and Therapy" : "Add Diagnosis and Therapy"}</h2>

            <label htmlFor="diagnosis">Diagnosis:</label>
            <br />
            <textarea
              id="diagnosis"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              required
              className={`home-modal-textarea ${error.diagnosis ? "error-border" : ""}`}
              disabled={!!selectedAppointment.diagnosis}
            />
            {error.diagnosis && <p className="home-error-message">{error.diagnosis}</p>}
            <br /><br />

            <label htmlFor="therapy">Therapy:</label>
            <br />
            <textarea
              id="therapy"
              value={therapy}
              onChange={(e) => setTherapy(e.target.value)}
              required
              className={`home-modal-textarea ${error.therapy ? "error-border" : ""}`}
              disabled={!!selectedAppointment.therapy}
            />
            {error.therapy && <p className="home-error-message">{error.therapy}</p>}
            <br /><br />

            {selectedAppointment.fileUrl ? (
              <button
                className="home-download-button"
                onClick={() => handleDownloadFile(selectedAppointment.fileUrl, selectedAppointment.fileType)}
              >
                Download File
              </button>
            ) : (
              <>
                <label htmlFor="file">Upload File (optional):</label>
                <input type="file" id="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileChange} />
              </>
            )}

            <div className="home-modal-buttons">
              {!selectedAppointment.diagnosis && !selectedAppointment.therapy && (
                <button className="home-save-button" onClick={() => handleSaveDiagnosisAndTherapy(selectedAppointment.id)}>
                  Save
                </button>
              )}
              <button className="home-cancel-button" onClick={() => setSelectedAppointment(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

Home.propTypes = {
  doctorData: PropTypes.shape({
    name: PropTypes.string.isRequired,
    doctorID: PropTypes.string.isRequired,
    surname: PropTypes.string.isRequired,
  }).isRequired,
};

export default Home;
