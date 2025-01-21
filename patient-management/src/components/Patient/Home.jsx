import PropTypes from "prop-types";

const Home = ({ user }) => {
  return (
    <div>
      <h1>Welcome, {user.firstName}!</h1>
      <p>Your Personal ID: {user.personalId}</p>
      <p>Your Email: {user.email}</p>
    </div>
  );
};

Home.propTypes = {
    user: PropTypes.shape({
      uid: PropTypes.string.isRequired,
      personalId: PropTypes.string.isRequired,
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string,
      email: PropTypes.string.isRequired,
    }).isRequired,
  };

export default Home;

