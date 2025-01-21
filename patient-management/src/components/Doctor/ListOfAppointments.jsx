import PropTypes from "prop-types"; 

const ListOfAppointments = ({ doctorData }) => {
  return (
    <div>
      <h1>List of All Appointments, for doctor {doctorData?.name} </h1>
      <p>View the complete list of appointments you have.</p>
    </div>
  );
};

ListOfAppointments.propTypes = {
    doctorData: PropTypes.shape({
      name: PropTypes.string.isRequired, 
      doctorId: PropTypes.string.isRequired, 
    }).isRequired,
  };

export default ListOfAppointments;