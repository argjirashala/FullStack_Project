import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase-config";

const FinishedAppointments = ({ user }) => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchFinishedAppointments = async () => {
      try {
        const appointmentsCollection = collection(db, "appointments");
        const q = query(appointmentsCollection, where("patientId", "==", user.personalId));
        const querySnapshot = await getDocs(q);

        const finishedAppointments = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((appointment) => appointment.diagnosis && appointment.therapy);

        // Fetch doctor's name and surname for each appointment
        const enhancedAppointments = await Promise.all(
          finishedAppointments.map(async (appointment) => {
            try {
              const doctorDocRef = doc(db, "doctors", appointment.doctorId);
              const doctorSnapshot = await getDoc(doctorDocRef);

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
  }, [user.personalId]);

  return (
    <div>
      <h1>Finished Appointments</h1>
      <p>Review your past appointments, {user?.firstName}.</p>

      {appointments.length > 0 ? (
        <ul>
          {appointments.map((appointment) => (
            <li key={appointment.id}>
              <strong>Date:</strong> {appointment.date} <strong>Time:</strong> {appointment.time}
              <p>
                <strong>Doctor:</strong> {appointment.doctorName} {appointment.doctorSurname}
              </p>
              <p>
                <strong>Diagnosis:</strong> {appointment.diagnosis}
              </p>
              <p>
                <strong>Therapy:</strong> {appointment.therapy}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No finished appointments found.</p>
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
