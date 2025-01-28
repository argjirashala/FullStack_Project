import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase-config";
import axios from "axios";

const Home = ({ doctorData }) => {
  const [todaysAppointments, setTodaysAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [therapy, setTherapy] = useState("");
  const [file, setFile] = useState(null);

  const cloudinaryConfig = {
    cloudName: import.meta.env.VITE_APP_CLOUDINARY_CLOUD_NAME,
    uploadPreset: import.meta.env.VITE_APP_CLOUDINARY_UPLOAD_PRESET,
    imageUploadUrl: import.meta.env.VITE_APP_CLOUDINARY_IMAGE_UPLOAD_URL,
    rawUploadUrl: import.meta.env.VITE_APP_CLOUDINARY_RAW_UPLOAD_URL,
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

  const uploadFileToCloudinary = async () => {
    if (!file) return null;

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
      alert("File upload failed.");
      return null;
    }
  };

  const handleSaveDiagnosisAndTherapy = async (appointmentId) => {
    try {
      const fileUrl = await uploadFileToCloudinary();
  
      const appointmentDocRef = doc(db, "appointments", appointmentId);
      await updateDoc(appointmentDocRef, {
        diagnosis,
        therapy,
        fileUrl,
        fileType: file ? file.type : null, 
      });
  
      alert("Diagnosis, therapy, and file saved successfully!");
  
      setTodaysAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment.id === appointmentId
            ? { ...appointment, diagnosis, therapy, fileUrl, fileType: file?.type || null }
            : appointment
        )
      );
  
      setSelectedAppointment(null);
      setDiagnosis("");
      setTherapy("");
      setFile(null);
    } catch (error) {
      console.error("Error saving diagnosis and therapy:", error);
      alert("An error occurred while saving the diagnosis, therapy, or file.");
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
  

  const handleViewOrEdit = (appointment) => {
    setSelectedAppointment(appointment.id);
    setDiagnosis(appointment.diagnosis || "");
    setTherapy(appointment.therapy || "");
    setFile(null);
  };

  return (
    <div>
      <h1>Welcome, Dr. {doctorData?.name}!</h1>
      <p>Doctor ID: {doctorData?.doctorID}</p>

      <h2>Today&apos;s Appointments</h2>
      {todaysAppointments.length > 0 ? (
        <ul>
          {todaysAppointments.map((appointment) => (
            <li key={appointment.id}>
              <strong>{appointment.time}</strong>
              <p>
                Patient: {appointment.patientFirstName} {appointment.patientLastName}
              </p>
              <p>Reason: {appointment.reason}</p>
              <button onClick={() => handleViewOrEdit(appointment)}>
                {appointment.diagnosis && appointment.therapy
                  ? "View/Update Diagnosis and Therapy"
                  : "Add Diagnosis and Therapy"}
              </button>
              {appointment.fileUrl && (
                <button
                  style={{ marginLeft: "10px" }}
                  onClick={() => handleDownloadFile(appointment.fileUrl, appointment.fileType)}
                >
                  Download File
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No appointments for today.</p>
      )}

      {selectedAppointment && (
        <div style={{ marginTop: "20px", border: "1px solid #ccc", padding: "10px" }}>
          <h2>
            {diagnosis && therapy ? "Update Diagnosis and Therapy" : "Add Diagnosis and Therapy"}
          </h2>
          <label htmlFor="diagnosis">Diagnosis:</label>
          <br />
          <textarea
            id="diagnosis"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            required
          />
          <br />
          <br />
          <label htmlFor="therapy">Therapy:</label>
          <br />
          <textarea
            id="therapy"
            value={therapy}
            onChange={(e) => setTherapy(e.target.value)}
            required
          />
          <br />
          <br />
          <label htmlFor="file">Upload File (PDF, PNG, JPG, JPEG):</label>
          <br />
          <input
            type="file"
            id="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileChange}
          />
          <br />
          <br />
          <button onClick={() => handleSaveDiagnosisAndTherapy(selectedAppointment)}>
            Save
          </button>
          <button
            style={{ marginLeft: "10px" }}
            onClick={() => {
              setSelectedAppointment(null);
              setDiagnosis("");
              setTherapy("");
              setFile(null);
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

Home.propTypes = {
  doctorData: PropTypes.shape({
    name: PropTypes.string.isRequired,
    doctorID: PropTypes.string.isRequired,
  }).isRequired,
};

export default Home;
