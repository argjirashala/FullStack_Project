import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase-config";

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

  const handleEditDiagnosisAndTherapy = async (appointmentId) => {
    try {
      const appointmentDocRef = doc(db, "appointments", appointmentId);
      await updateDoc(appointmentDocRef, { diagnosis, therapy });

      alert("Diagnosis and therapy updated successfully!");

      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment.id === appointmentId
            ? { ...appointment, diagnosis, therapy }
            : appointment
        )
      );
      setFilteredAppointments((prevFiltered) =>
        prevFiltered.map((appointment) =>
          appointment.id === appointmentId
            ? { ...appointment, diagnosis, therapy }
            : appointment
        )
      );

      setSelectedAppointment(null);
      setDiagnosis("");
      setTherapy("");
    } catch (error) {
      console.error("Error updating diagnosis and therapy:", error);
      alert("An error occurred while updating the diagnosis and therapy.");
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
          <button onClick={() => handleEditDiagnosisAndTherapy(selectedAppointment)}>
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

ListOfAppointments.propTypes = {
  doctorData: PropTypes.shape({
    name: PropTypes.string.isRequired,
    doctorID: PropTypes.string.isRequired,
  }).isRequired,
};

export default ListOfAppointments;
