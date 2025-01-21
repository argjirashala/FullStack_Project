import PropTypes from "prop-types"; 

const SetAvailability = ( {doctorData} ) => {
  return (
    <div>
      <h1>Set Availability doctor {doctorData?.name}</h1>
      <p>Here, you can set your working hours and availability.</p>
    </div>
  );
};

SetAvailability.propTypes = {
    doctorData: PropTypes.shape({
      name: PropTypes.string.isRequired, 
      doctorId: PropTypes.string.isRequired, 
    }).isRequired,
  };

export default SetAvailability;
