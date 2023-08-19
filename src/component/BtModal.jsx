import { Toast, Button } from 'react-bootstrap';
import { AiOutlineCheck, AiOutlineClose } from 'react-icons/ai';
// eslint-disable-next-line react/prop-types
const VideoCallInviteToast = ({ show, onClose, createAnswer, handleCloseToast }) => {
  return (
    <Toast pos show={show} onClose={onClose} className="position-fixed top-0 start-50 translate-middle-x">
      <Toast.Header>
        <strong className="me-auto">Video Conference Invitation</strong>
      </Toast.Header>
      <Toast.Body>
        <p className='mb-0'>You have been invited to join a video conference. Click to accept and join.</p>
        <Button size='sm' onClick={() => {
            createAnswer()
            handleCloseToast()
        }} className="btn bg-transparent border-0 shadow mt-2"><AiOutlineCheck color='green' /></Button>
        <Button size='sm' onClick={() => {
            handleCloseToast()
        }} className="btn bg-transparent border-0 shadow mt-2 ms-3"><AiOutlineClose color='red' /></Button>
      
      </Toast.Body>
    </Toast>
  );
};

export default VideoCallInviteToast;
