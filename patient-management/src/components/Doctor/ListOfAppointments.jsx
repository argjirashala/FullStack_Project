import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase-config";
import axios from "axios";

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

  const cloudinaryConfig = {
    cloudName: import.meta.env.VITE_APP_CLOUDINARY_CLOUD_NAME,
    uploadPreset: import.meta.env.VITE_APP_CLOUDINARY_UPLOAD_PRESET,
    imageUploadUrl: import.meta.env.VITE_APP_CLOUDINARY_IMAGE_UPLOAD_URL,
    rawUploadUrl: import.meta.env.VITE_APP_CLOUDINARY_RAW_UPLOAD_URL,
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

  const handleEditDiagnosisAndTherapy = async (appointmentId) => {
    try {
      const fileUrl = await uploadFileToCloudinary();

      const appointmentDocRef = doc(db, "appointments", appointmentId);
      await updateDoc(appointmentDocRef, {
        diagnosis,
        therapy,
        fileUrl,
        fileType: file?.type || null,
      });

      alert("Diagnosis, therapy, and file updated successfully!");

      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment.id === appointmentId
            ? { ...appointment, diagnosis, therapy, fileUrl, fileType: file?.type || null }
            : appointment
        )
      );

      setFilteredAppointments((prevFiltered) =>
        prevFiltered.map((appointment) =>
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
      console.error("Error updating diagnosis and therapy:", error);
      alert("An error occurred while updating the diagnosis, therapy, or file.");
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

  return (
    <div>
      <h1>List of All Appointments for Dr. {doctorData?.name}</h1>
      <p>View and edit the list of finished appointments.</p>

      <div>
        <h3>Search Appointments</h3>
        <label>
          Patient First Name:
          <input
            type="text"
            value={searchCriteria.firstName}
            onChange={(e) => setSearchCriteria({ ...searchCriteria, firstName: e.target.value })}
          />
        </label>
        <br />
        <label>
          Patient Last Name:
          <input
            type="text"
            value={searchCriteria.lastName}
            onChange={(e) => setSearchCriteria({ ...searchCriteria, lastName: e.target.value })}
          />
        </label>
        <br />
        <label>
          Patient Personal ID:
          <input
            type="text"
            value={searchCriteria.personalId}
            onChange={(e) => setSearchCriteria({ ...searchCriteria, personalId: e.target.value })}
          />
        </label>
        <br />
        <label>
          Appointment Date:
          <input
            type="date"
            value={searchCriteria.appointmentDate}
            onChange={(e) =>
              setSearchCriteria({ ...searchCriteria, appointmentDate: e.target.value })
            }
          />
        </label>
        <br />
        <button onClick={handleSearch}>Search</button>
      </div>

      {filteredAppointments.length > 0 ? (
        <ul>
          {filteredAppointments.map((appointment) => (
            <li key={appointment.id}>
              <strong>Date:</strong> {appointment.date} <strong>Time:</strong> {appointment.time}
              <p>
                <strong>Patient:</strong> {appointment.patientFirstName} {appointment.patientLastName}
              </p>
              <p>
                <strong>Diagnosis:</strong> {appointment.diagnosis}
              </p>
              <p>
                <strong>Therapy:</strong> {appointment.therapy}
              </p>
              {appointment.fileUrl && (
                <button
                  onClick={() => handleDownloadFile(appointment.fileUrl, appointment.fileType)}
                >
                  Download File
                </button>
              )}
              <button
                onClick={() => {
                  setSelectedAppointment(appointment.id);
                  setDiagnosis(appointment.diagnosis);
                  setTherapy(appointment.therapy);
                }}
              >
                Edit Details
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No finished appointments found.</p>
      )}

      {selectedAppointment && (
        <div style={{ marginTop: "20px", border: "1px solid #ccc", padding: "10px" }}>
          <h2>Edit Diagnosis and Therapy</h2>
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
          <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileChange} />
          <br />
          <br />
          <button onClick={() => handleEditDiagnosisAndTherapy(selectedAppointment)}>Save</button>
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

ListOfAppointments.propTypes = {
  doctorData: PropTypes.shape({
    name: PropTypes.string.isRequired,
    doctorID: PropTypes.string.isRequired,
  }).isRequired,
};

export default ListOfAppointments;
