/* eslint-disable no-unused-vars */
// eslint-disable-next-line no-unused-vars
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client'
import Modal from './component/Modal';


const socket = io('http://localhost:3000', {
transports: ['websocket'], upgrade: false
});

function App() {
        const [offerDetails, setOfferDetails] = useState({})
        const [answerDetails, setAnswerDetails] = useState({});
        const [callee, setCallee] = useState('');
        const localVideoRef = useRef(null);
        const [me, setMe] = useState('');
        const localPeer = useRef();
        const [isCalling, setIsCalling] = useState(false);
        const [isAnswered, setIsAnswered] = useState(false);
        const candidates = useRef([]);
        const recievedVideo = useRef();
   
        useState(() => {

        socket.on('connection-success', (user) => {
          setMe(user)
        })

        }, [])

        const createPeerConnection = () => {
          let servers = {
            iceServers: [
                {urls: 'stun:stun.l.google.com:19302'},
                {urls: 'stun:stun1.l.google.com:19302'},
                {urls: 'stun:stun.services.mozilla.com:3478'},
                {urls: 'stun:stun.numb.viagenie.ca:3478'},
                {urls: 'stun:resolver1.opendns.com:443'},
                {urls: 'stun:stun.stunprotocol.org:3478'}
            ]
        };
              localPeer.current = new RTCPeerConnection(servers);
              localPeer.current.onicecandidate = handleICECandidateEvent;
              localPeer.current.ontrack = handleTrackEvent;
        }  
      


          const createOffer = () => {
          setIsCalling(true);
            localPeer.current.createOffer().then((sdp) => {
              handleNewICECandidateMsg();
            localPeer.current.setLocalDescription(sdp);
            socket.emit('video-offer', {sdp: sdp, reciever: callee, sender: me})
          })
        }

      const createAnswer = async () => {
        createPeerConnection();
        setIsAnswered(true);
      const { sdp, receiver, sender } = offerDetails;
    
      try {
        await localPeer.current.setRemoteDescription(new RTCSessionDescription(sdp));
        navigator.mediaDevices.getUserMedia({audio:true, video:true}).then((stream) => {
          stream.getTracks().forEach(track => localPeer.current.addTrack(track, stream));
          }).catch((error) => console.log(`error: ${error}`))

          handleNewICECandidateMsg();
        const answerSdp = await localPeer.current.createAnswer();
        
        await localPeer.current.setLocalDescription(answerSdp);
    
        socket.emit('video-answer', {
          sdp: answerSdp,
          receiver: receiver,
          answering: sender,
          status: 'accepted'
        })
      } catch (error) {
        console.log(`Error creating answer: ${error}`);
      }
    };
    
     function handleICECandidateEvent(event) {
      if(event.candidate) {
        socket.emit('new-ice-candidate', {
          candidate: event.candidate
        })
      }
  }
    

   function handleNewICECandidateMsg() {
    candidates.current.forEach(candidate => {
      console.log(candidate)

        const foundCandidate = new RTCIceCandidate(candidate.candidate);
        localPeer.current.addIceCandidate(foundCandidate)
          .catch((error) => {
            // alert(`${error}`)
            console.log(`error ${error}`)
          })
      })
    }

        function handleTrackEvent(event) {
          recievedVideo.current.srcObject = event.streams[0];
        }

              
      useEffect(() => {
        // Get the local media capibilities... 
        createPeerConnection();
        navigator.mediaDevices.getUserMedia({audio:true, video:true}).then((stream) => {
        localVideoRef.current.srcObject = stream
        stream.getTracks().forEach(track => localPeer.current.addTrack(track, stream));
        }).catch((error) => console.log(`error: ${error}`))

  
      socket.on('new-ice-candidate', (data) => {
        if(data) {
          candidates.current = [...candidates.current, data]
          // handleNewICECandidateMsg()
        }
      })


      socket.on('video-offer', (offer) => {
        if(offer) {
          setOfferDetails(offer);
          alert('Someone is Calling you!!')
        }
      })

      socket.on('video-answer', (answer) => {
        if(answer) {
          setAnswerDetails(answer)
          localPeer.current.setRemoteDescription(new RTCSessionDescription(answer.sdp))
          // localPeer.current.setLocalDescription(answer.sdp);
        }
        // handleICECandidateEvent()
    })


}, [])

return (
    <>
    <div>
    <h1>Video Chat App</h1>
    <video playsInline autoPlay ref={localVideoRef}></video>
    <video playsInline autoPlay ref={recievedVideo}></video>
    <div style={{display:'flex', gap:'2em'}}>
      <input type="text" value={callee} onChange={(e) => setCallee(e.target.value)}/>
      <button onClick={createOffer}>Call now</button>
      <button onClick={createAnswer}>Answer the Call</button>
      {/* <button onClick={handleNewICECandidateMsg}>Add Candidates</button> */}
    </div>
    </div>

    <h1>{me.id}</h1>
    
  
    
    </>
  )
}

export default App
