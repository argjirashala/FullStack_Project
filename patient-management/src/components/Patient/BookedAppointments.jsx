import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase-config";
import "./BookedAppointments.css";

const BookedAppointments = ({ user }) => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchBookedAppointments = async () => {
      try {
        const appointmentsCollection = collection(db, "appointments");
        const q = query(appointmentsCollection, where("patientId", "==", user.personalId));
        const querySnapshot = await getDocs(q);

        const today = new Date().toISOString().split("T")[0];

        const bookedAppointments = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((appointment) => appointment.date >= today);
          
        const enhancedAppointments = await Promise.all(
          bookedAppointments.map(async (appointment) => {
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
        console.error("Error fetching booked appointments:", error);
      }
    };

    fetchBookedAppointments();
  }, [user.personalId]);

  return (
    <div className="booked-appointments-container">
      <h1 className="booked-appointments-title">Booked Appointments</h1>
      <p className="booked-appointments-description">
        Manage your appointments here, {user?.firstName}.
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
              <p className="appointment-card-detail">
                <strong>Reason:</strong> {appointment.reason}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-appointments-message">No booked appointments found.</p>
      )}
    </div>
  );
};

BookedAppointments.propTypes = {
  user: PropTypes.shape({
    uid: PropTypes.string.isRequired,
    personalId: PropTypes.string.isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string,
    email: PropTypes.string.isRequired,
  }).isRequired,
};

export default BookedAppointments;
