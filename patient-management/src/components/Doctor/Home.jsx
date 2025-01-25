import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase-config";

const Home = ({ doctorData }) => {
  const [todaysAppointments, setTodaysAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [therapy, setTherapy] = useState("");

  useEffect(() => {
    const fetchTodaysAppointments = async () => {
      if (!doctorData?.doctorID) return; // Guard clause to prevent invalid queries

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

  const handleSaveDiagnosisAndTherapy = async (appointmentId) => {
    try {
      const appointmentDocRef = doc(db, "appointments", appointmentId);
      await updateDoc(appointmentDocRef, { diagnosis, therapy });

      alert("Diagnosis and therapy saved successfully!");

      setTodaysAppointments((prevAppointments) =>
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
      console.error("Error saving diagnosis and therapy:", error);
      alert("An error occurred while saving the diagnosis and therapy.");
    }
  };

  const handleViewOrEdit = (appointment) => {
    setSelectedAppointment(appointment.id);
    setDiagnosis(appointment.diagnosis || "");
    setTherapy(appointment.therapy || "");
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
          <button onClick={() => handleSaveDiagnosisAndTherapy(selectedAppointment)}>
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

Home.propTypes = {
  doctorData: PropTypes.shape({
    name: PropTypes.string.isRequired,
    doctorID: PropTypes.string.isRequired,
  }).isRequired,
};

export default Home;

