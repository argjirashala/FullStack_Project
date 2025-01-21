import { Link} from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import BookedAppointments from "./BookedAppointments";
import FinishedAppointments from "./FinishedAppointments";

const PatientView = () => {
  return (
    <div>
      <nav>
        <Link to="/patient/home">Home</Link>
        <Link to="/patient/booked-appointments">Booked Appointments</Link>
        <Link to="/patient/finished-appointments">Finished Appointments</Link>
      </nav>
      <div>
        <Routes>
          <Route path="home" element={<Home />} />
          <Route path="booked-appointments" element={<BookedAppointments />} />
          <Route path="finished-appointments" element={<FinishedAppointments />} />
        </Routes>
      </div>
    </div>
  );
};


export default PatientView;
