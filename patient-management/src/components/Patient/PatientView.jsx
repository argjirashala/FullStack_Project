import { Link, Routes, Route, useLocation } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import Home from "./Home";
import BookedAppointments from "./BookedAppointments";
import FinishedAppointments from "./FinishedAppointments";
import PropTypes from "prop-types";
import "./PatientView.css";

const PatientView = ({ user }) => {
  const location = useLocation();

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        window.location.reload();
      })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  };

  return (
    <div className="patient-view-container">
      <nav className="navbar">
        <div className="navbar-links">
          <Link
            to="/patient/home"
            className={`navbar-link ${
              location.pathname === "/patient/home" ? "active-link" : ""
            }`}
          >
            Home
          </Link>
          <Link
            to="/patient/booked-appointments"
            className={`navbar-link ${
              location.pathname === "/patient/booked-appointments"
                ? "active-link"
                : ""
            }`}
          >
            Booked Appointments
          </Link>
          <Link
            to="/patient/finished-appointments"
            className={`navbar-link ${
              location.pathname === "/patient/finished-appointments"
                ? "active-link"
                : ""
            }`}
          >
            Finished Appointments
          </Link>
        </div>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </nav>
      <div className="content-container">
        <Routes>
          <Route path="home" element={<Home user={user} />} />
          <Route
            path="booked-appointments"
            element={<BookedAppointments user={user} />}
          />
          <Route
            path="finished-appointments"
            element={<FinishedAppointments user={user} />}
          />
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
