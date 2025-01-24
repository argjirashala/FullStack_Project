import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase-config";

const UpcomingAppointments = ({ doctorData }) => {
  const [appointments, setAppointments] = useState([]);

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
          (appointment) => appointment.date > today
        );

        setAppointments(upcomingAppointments);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };

    fetchAppointments();
  }, [doctorData.doctorId]);

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
            </li>
          ))}
        </ul>
      ) : (
        <p>No upcoming appointments found.</p>
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
