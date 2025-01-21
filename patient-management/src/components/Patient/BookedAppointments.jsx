import PropTypes from "prop-types";

const BookedAppointments = ({ user }) => {
  return (
    <div>
      <h1>Booked Appointments</h1>
      <p>Manage your appointments here, {user?.firstName}.</p>
    </div>
  );
};

BookedAppointments.propTypes = {
    user: PropTypes.shape({
      uid: PropTypes.string.isRequired,
      personalId: PropTypes.string.isRequired,
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string,
      email: PropTypes.string.isRequired,
    }).isRequired,
  };


export default BookedAppointments;
