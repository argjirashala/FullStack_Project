import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase-config";
import "./UpcomingAppointments.css";

const UpcomingAppointments = ({ doctorData }) => {
  const [appointments, setAppointments] = useState([]);
  const getDocsFunc = window.getDocs || getDocs;

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const appointmentsCollection = collection(db, "appointments");
        const q = query(
          appointmentsCollection,
          where("doctorId", "==", doctorData.doctorID)
        );
        const querySnapshot = await getDocsFunc(q);

        const fetchedAppointments = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const today = new Date().toISOString().split("T")[0];

        const upcomingAppointments = fetchedAppointments.filter(
          (appointment) => appointment.date > today
        );

        setAppointments(upcomingAppointments);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };

    fetchAppointments();
  }, [doctorData.doctorID, getDocsFunc]);

  return (
    <div className="upcoming-appointments-container">
      <h1 className="upcoming-appointments-header">
        Upcoming Appointments for Dr. {doctorData?.name}
      </h1>
      <p className="upcoming-appointments-description">
        View the list of your upcoming appointments.
      </p>

      {appointments.length > 0 ? (
        <ul className="upcoming-appointments-list">
          {appointments.map((appointment) => (
            <li key={appointment.id} className="upcoming-appointment-item">
              <strong className="appointment-date">{appointment.date}</strong>{" "}
              at{" "}
              <strong className="appointment-time">{appointment.time}</strong>
              <p className="appointment-patient">
                Patient: {appointment.patientFirstName}{" "}
                {appointment.patientLastName}
              </p>
              <p className="appointment-reason">Reason: {appointment.reason}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-upcoming-appointments-message">
          No upcoming appointments found.
        </p>
      )}
    </div>
  );
};

UpcomingAppointments.propTypes = {
  doctorData: PropTypes.shape({
    name: PropTypes.string.isRequired,
    doctorID: PropTypes.string.isRequired,
  }).isRequired,
};

export default UpcomingAppointments;
