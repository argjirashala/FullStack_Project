import { Routes, Route } from 'react-router-dom';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import PatientView from "./components/Patient/PatientView";

const App = () => {
  return (
    <div>
      <Routes>
        {/* <Route path="/" element={} /> */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/patient/*" element={<PatientView />} />
      </Routes>
    </div>
  );
};

export default App;
