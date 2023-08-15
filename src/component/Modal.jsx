

// eslint-disable-next-line react/prop-types
const Modal = ({ handleSubmit, caller }) => {
  
  const styles = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    zIndex: 1000, // Adjust the z-index as needed
    // Add other modal-specific styles here
  }

    return (
    <div style={styles}>
         <h1>{caller} is calling</h1>
  <button onClick={handleSubmit}>Accept SDP Details</button>
        
    </div>
  )
}

export default Modal