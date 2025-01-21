import PropTypes from "prop-types"; 

const UpcomingAppointments = ( {doctorData} ) => {
  return (
    <div>
      <h1>Upcoming Appointments for doctor {doctorData?.name} </h1>
      <p>View the list of your upcoming appointments.</p>
    </div>
  );
};

UpcomingAppointments.propTypes = {
    doctorData: PropTypes.shape({
      name: PropTypes.string.isRequired, 
      doctorId: PropTypes.string.isRequired, 
    }).isRequired,
  };

export default UpcomingAppointments;
