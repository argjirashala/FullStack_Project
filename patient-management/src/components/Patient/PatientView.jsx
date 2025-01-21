import { Link, Routes, Route } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import Home from "./Home";
import BookedAppointments from "./BookedAppointments";
import FinishedAppointments from "./FinishedAppointments";
import PropTypes from "prop-types";

const PatientView = ({ user }) => {
  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        console.log("Logged out successfully!");
        window.location.reload(); 
      })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  };

  return (
    <div>
      <nav>
        <Link to="/patient/home">Home</Link>
        <Link to="/patient/booked-appointments">Booked Appointments</Link>
        <Link to="/patient/finished-appointments">Finished Appointments</Link>
        <button onClick={handleLogout}>
          Logout
        </button>
      </nav>
      <div>
        <Routes>
          <Route path="home" element={<Home user={user} />} />
          <Route path="booked-appointments" element={<BookedAppointments user={user} />} />
          <Route path="finished-appointments" element={<FinishedAppointments user={user} />} />
        </Routes>
      </div>
    </div>
  );
};

PatientView.propTypes = {
    user: PropTypes.shape({
      uid: PropTypes.string.isRequired,
      personalId: PropTypes.string.isRequired,
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string,
      email: PropTypes.string.isRequired,
    }).isRequired,
  };


export default PatientView;
