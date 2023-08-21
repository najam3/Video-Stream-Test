/* eslint-disable no-unused-vars */
// eslint-disable-next-line no-unused-vars
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client'
import Redesign from './component/Redesign';
import useClipboard from 'react-use-clipboard';
import VideoCallInviteToast from './component/BtModal';
const socket = io('https://video-chat-application-8c72f4072331.herokuapp.com/');
// const socket = io('http://localhost:3000', {
//   transports: ['websocket']
// });

function App() {
        const [offerDetails, setOfferDetails] = useState({})
        const [answerDetails, setAnswerDetails] = useState({});
        const [callee, setCallee] = useState('');
        const localVideoRef = useRef(null);
        const [me, setMe] = useState('');
        const localPeer = useRef();
        const candidates = useRef([]);
        const recievedVideo = useRef();
        const [isCopied, setCopied] = useClipboard(me.id);
        const [showToast, setShowToast] = useState(false);
        const [connected,setConnected] = useState(false);
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
      
 
        const handleShowToast = () => {
          setShowToast(true);
        };
      
        const handleCloseToast = () => {
          setShowToast(false);
        };


          const createOffer = () => {
            localPeer.current.createOffer().then((sdp) => {
            localPeer.current.setLocalDescription(sdp);
            socket.emit('video-offer', {sdp: sdp, reciever: callee, sender: me})
          })
        }

      const createAnswer = async () => {
      const { sdp, receiver, sender } = offerDetails;

      try {
            // createPeerConnection();
           await localPeer.current.setRemoteDescription(new RTCSessionDescription(sdp));
           const answerSdp = await localPeer.current.createAnswer();
           await localPeer.current.setLocalDescription(answerSdp);
           handleNewICECandidateMsg()
              socket.emit('video-answer', {
              sdp: answerSdp,
              receiver: receiver,
              answering: sender,
              status: 'accepted'
        })
      } 
      catch (error) {
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
            candidates?.current.forEach(candidate => {
                const foundCandidate = new RTCIceCandidate(candidate.candidate);
                localPeer.current.addIceCandidate(foundCandidate)
                  .catch((error) => {
                    // alert(`${error}`)
                    console.log(`error ${error}`)
                  })
              })
            }

        function handleTrackEvent(event) {
          if(recievedVideo.current.srcObject) return;
          recievedVideo.current.srcObject = event.streams[0];
        }

        function calleeId(e) {
          setCallee(e.target.value)
        }

     async function handleVideoAnswer(answer) {
        await localPeer.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
        
      useEffect(() => {
        // Get the local media capibilities... 
        createPeerConnection()
        navigator.mediaDevices.getUserMedia({audio:true, video:true}).then((stream) => {
        localVideoRef.current.srcObject = stream
        stream.getTracks().forEach(track => localPeer.current.addTrack(track, stream));
        }).catch((error) => console.log(`error: ${error}`))

  
        socket.on('connection-success', (user) => {
          setMe(user)
        })


        socket.on('video-answer',  (answer) => {
               setAnswerDetails(answer)
               handleVideoAnswer(answer.sdp)
               handleNewICECandidateMsg();
        })


      socket.on('new-ice-candidate', (data) => {
        if(data) {
          candidates.current = [...candidates.current, data]
        }
      })


      socket.on('video-offer', async (offer) => {
        if(offer) {
          setOfferDetails(offer);
          handleShowToast();
         
        }
      })
}, [])



return (
  <>
    <Redesign callee={callee} 
    calleeId={calleeId} 
    isCopied={isCopied} 
    createAnswer={createAnswer}
     createOffer={createOffer}
    localRef={localVideoRef}
    remoteRef={recievedVideo}
    me={me}
    copyHandler={setCopied}/>
     
     
   <VideoCallInviteToast show={showToast} onClose={handleCloseToast} createAnswer={() => {
    createAnswer()
    
    handleCloseToast()
   }}/>
    </>
  )
}





export default App