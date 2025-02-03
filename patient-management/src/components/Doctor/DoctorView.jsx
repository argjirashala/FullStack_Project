import { useEffect, useState } from "react";
import { Link, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Home from "./Home";
import SetAvailability from "./Availability";
import UpcomingAppointments from "./UpcomingAppointments";
import ListOfAppointments from "./ListOfAppointments";
import Profile from "./Profile";
import "./DoctorView.css";

const DoctorView = () => {
  const [doctorData, setDoctorData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedDoctorData = localStorage.getItem("doctorData");
    if (storedDoctorData) {
      setDoctorData(JSON.parse(storedDoctorData));
    } else {
      navigate("/doctor-login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("doctorData");
    setDoctorData(null);
    navigate("/doctor-login");
  };

  if (!doctorData) {
    return <div>Loading doctor data...</div>; 
  }

  return (
    <div className="view-doctor-view-container">
      <nav className="view-doctor-nav">
        <Link to="/doctor/home" className={location.pathname.includes("home") ? "active" : ""}>Home</Link>
        <Link to="/doctor/set-availability" className={location.pathname.includes("set-availability") ? "active" : ""}>Set Availability</Link>
        <Link to="/doctor/upcoming-appointments" className={location.pathname.includes("upcoming-appointments") ? "active" : ""}>Upcoming Appointments</Link>
        <Link to="/doctor/list-of-appointments" className={location.pathname.includes("list-of-appointments") ? "active" : ""}>List of Appointments</Link>
        <Link to="/doctor/profile" className={location.pathname.includes("profile") ? "active" : ""}>Profile</Link>
        <button className="view-logout-button" onClick={handleLogout}>Logout</button>
      </nav>

      <div className="view-doctor-content">
        <Routes>
          <Route path="home" element={<Home doctorData={doctorData} />} />
          <Route path="set-availability" element={<SetAvailability doctorData={doctorData} />} />
          <Route path="upcoming-appointments" element={<UpcomingAppointments doctorData={doctorData} />} />
          <Route path="list-of-appointments" element={<ListOfAppointments doctorData={doctorData} />} />
          <Route path="profile" element={<Profile doctorData={doctorData} />} />
        </Routes>
      </div>
    </div>
  );
};

export default DoctorView;
