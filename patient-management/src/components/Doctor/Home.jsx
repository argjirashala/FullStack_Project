import PropTypes from "prop-types"; 

const Home = ({ doctorData }) => {
  return (
    <div>
      <h1>Welcome, {doctorData?.name}!</h1>
      <p>Doctor ID: {doctorData?.doctorId}</p>
    </div>
  );
};

Home.propTypes = {
  doctorData: PropTypes.shape({
    name: PropTypes.string.isRequired, 
    doctorId: PropTypes.string.isRequired, 
  }).isRequired,
};

export default Home;
