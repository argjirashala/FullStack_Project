import { Link, Routes, Route } from "react-router-dom";
import Home from "./Home";
import SetAvailability from "./Availability";
import UpcomingAppointments from "./UpcomingAppointments";
import ListOfAppointments from "./ListOfAppointments";

const DoctorView = () => {
  return (
    <div>
      <nav>
        <Link to="/doctor/home">Home</Link>
        <Link to="/doctor/set-availability">Set Availability</Link>
        <Link to="/doctor/upcoming-appointments">Upcoming Appointments</Link>
        <Link to="/doctor/list-of-appointments">List of Appointments</Link>
      </nav>

      <div>
        <Routes>
          <Route path="home" element={<Home />} />
          <Route path="set-availability" element={<SetAvailability />} />
          <Route path="upcoming-appointments" element={<UpcomingAppointments />} />
          <Route path="list-of-appointments" element={<ListOfAppointments />} />
        </Routes>
      </div>
    </div>
  );
};

export default DoctorView;