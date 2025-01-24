import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase-config";

const UpcomingAppointments = ({ doctorData }) => {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [therapy, setTherapy] = useState("");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const appointmentsCollection = collection(db, "appointments");
        const q = query(appointmentsCollection, where("doctorId", "==", doctorData.doctorId));
        const querySnapshot = await getDocs(q);

        const fetchedAppointments = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const today = new Date().toISOString().split("T")[0];

        const upcomingAppointments = fetchedAppointments.filter(
          (appointment) => appointment.date >= today
        );

        setAppointments(upcomingAppointments);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };

    fetchAppointments();
  }, [doctorData.doctorId]);

  const handleAddDiagnosisAndTherapy = async (appointmentId) => {
    try {
      const appointmentDocRef = doc(db, "appointments", appointmentId);
      await updateDoc(appointmentDocRef, { diagnosis, therapy });

      alert("Diagnosis and therapy added successfully!");

      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment.id === appointmentId
            ? { ...appointment, diagnosis, therapy }
            : appointment
        )
      );

      setSelectedAppointment(null);
      setDiagnosis("");
      setTherapy("");
    } catch (error) {
      console.error("Error adding diagnosis and therapy:", error);
      alert("An error occurred while adding the diagnosis and therapy.");
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div>
      <h1>Upcoming Appointments for Dr. {doctorData?.name}</h1>
      <p>View the list of your upcoming appointments.</p>

      {appointments.length > 0 ? (
        <ul>
          {appointments.map((appointment) => (
            <li key={appointment.id}>
              <strong>{appointment.date}</strong> at <strong>{appointment.time}</strong>
              <p>
                Patient: {appointment.patientFirstName} {appointment.patientLastName}
              </p>
              <p>Reason: {appointment.reason}</p>

              {appointment.date === today && (
                <button onClick={() => setSelectedAppointment(appointment.id)}>
                  Add Diagnosis and Therapy
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No upcoming appointments found.</p>
      )}

      {selectedAppointment && (
        <div style={{ marginTop: "20px", border: "1px solid #ccc", padding: "10px" }}>
          <h2>Add Diagnosis and Therapy</h2>
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
          <button onClick={() => handleAddDiagnosisAndTherapy(selectedAppointment)}>
            Save
          </button>
          <button
            style={{ marginLeft: "10px" }}
            onClick={() => {
              setSelectedAppointment(null);
              setDiagnosis("");
              setTherapy("");
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

UpcomingAppointments.propTypes = {
  doctorData: PropTypes.shape({
    name: PropTypes.string.isRequired,
    doctorId: PropTypes.string.isRequired,
  }).isRequired,
};

export default UpcomingAppointments;
