import PropTypes from "prop-types";

const FinishedAppointments = ({ user }) => {
  return (
    <div>
      <h1>Finished Appointments</h1>
      <p>Review your past appointments, {user?.firstName}.</p>
    </div>
  );
};

FinishedAppointments.propTypes = {
    user: PropTypes.shape({
      uid: PropTypes.string.isRequired,
      personalId: PropTypes.string.isRequired,
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string,
      email: PropTypes.string.isRequired,
    }).isRequired,
  };

export default FinishedAppointments;

