import { useEffect, useState } from "react";
import { Link, Routes, Route, useNavigate } from "react-router-dom";
import Home from "./Home";
import SetAvailability from "./Availability";
import UpcomingAppointments from "./UpcomingAppointments";
import ListOfAppointments from "./ListOfAppointments";

const DoctorView = () => {
  const [doctorData, setDoctorData] = useState(null);
  const navigate = useNavigate();

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
    return <div>Loading...</div>;
  }

  return (
    <div>
      <nav>
        <Link to="/doctor/home">Home</Link>
        <Link to="/doctor/set-availability">Set Availability</Link>
        <Link to="/doctor/upcoming-appointments">Upcoming Appointments</Link>
        <Link to="/doctor/list-of-appointments">List of Appointments</Link>
        <button onClick={handleLogout}>
          Logout
        </button>
      </nav>

      <div>
        <Routes>
          <Route path="home" element={<Home doctorData={doctorData} />} />
          <Route path="set-availability" element={<SetAvailability doctorData={doctorData} />} />
          <Route path="upcoming-appointments" element={<UpcomingAppointments doctorData={doctorData} />} />
          <Route path="list-of-appointments" element={<ListOfAppointments doctorData={doctorData} />} />
        </Routes>
      </div>
    </div>
  );
};


export default DoctorView;
