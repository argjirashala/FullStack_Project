import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebase-config";
import axios from "axios";
import "./FinishedAppointments.css";

const FinishedAppointments = ({ user }) => {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const getDocsFunc = window.getDocs || getDocs;
  const getDocFunc = window.getDoc || getDoc;


  useEffect(() => {
    const fetchFinishedAppointments = async () => {
      try {
        const appointmentsCollection = collection(db, "appointments");
        const q = query(appointmentsCollection, where("patientId", "==", user.personalId));
        const querySnapshot = await getDocsFunc(q);

        const finishedAppointments = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((appointment) => appointment.diagnosis && appointment.therapy);

        const enhancedAppointments = await Promise.all(
          finishedAppointments.map(async (appointment) => {
            try {
              const doctorDocRef = doc(db, "doctors", appointment.doctorId);
              const doctorSnapshot = await getDocFunc(doctorDocRef);

              if (doctorSnapshot.exists()) {
                const doctorData = doctorSnapshot.data();
                return {
                  ...appointment,
                  doctorName: doctorData.name,
                  doctorSurname: doctorData.surname,
                };
              } else {
                return { ...appointment, doctorName: "Unknown", doctorSurname: "Unknown" };
              }
            } catch (error) {
              console.error("Error fetching doctor data:", error);
              return { ...appointment, doctorName: "Unknown", doctorSurname: "Unknown" };
            }
          })
        );

        setAppointments(enhancedAppointments);
      } catch (error) {
        console.error("Error fetching finished appointments:", error);
      }
    };

    fetchFinishedAppointments();
  }, [user.personalId, getDocFunc, getDocsFunc]);

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
    <div className="finished-appointments-container">
      <h1 className="finished-appointments-title">Finished Appointments</h1>
      <p className="finished-appointments-description">
        Review your past appointments, {user?.firstName}.
      </p>

      {appointments.length > 0 ? (
        <div className="appointments-list">
          {appointments.map((appointment) => (
            <div className="appointment-card" key={appointment.id}>
              <h3 className="appointment-card-title">
                Appointment with Dr. {appointment.doctorName} {appointment.doctorSurname}
              </h3>
              <p className="appointment-card-detail">
                <strong>Date:</strong> {appointment.date}
              </p>
              <p className="appointment-card-detail">
                <strong>Time:</strong> {appointment.time}
              </p>
              <button
                className="show-diagnosis-button"
                onClick={() => {
                  setSelectedAppointment(appointment);
                  setShowModal(true);
                }}
              >
                Show Diagnosis and Therapy
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-appointments-message">No finished appointments found.</p>
      )}

      {showModal && selectedAppointment && (
        <div className="modal-overlay">
          <div className="modal-content">
          <button
    className="close-modal-x-button"
    onClick={() => setShowModal(false)}
    aria-label="Close"
  >
    X
    </button>
            <h2>
              Diagnosis and Therapy from Dr. {selectedAppointment.doctorName}{" "}
              {selectedAppointment.doctorSurname}
            </h2>
            <p>
              <strong>Reason:</strong> {selectedAppointment.reason}
            </p>
            <p>
              <strong>Diagnosis:</strong> {selectedAppointment.diagnosis}
            </p>
            <p>
              <strong>Therapy:</strong> {selectedAppointment.therapy}
            </p>
            {selectedAppointment.fileUrl && (
              <button
                className="download-file-button"
                onClick={() =>
                  handleDownloadFile(selectedAppointment.fileUrl, selectedAppointment.fileType)
                }
              >
                Download File
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

FinishedAppointments.propTypes = {
  user: PropTypes.shape({
    uid: PropTypes.string.isRequired,
    personalId: PropTypes.string.isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string,
    email: PropTypes.string.isRequired,
  }).isRequired,
};

export default FinishedAppointments;
