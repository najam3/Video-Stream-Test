/* eslint-disable no-unused-vars */
// eslint-disable-next-line no-unused-vars
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client'
import Modal from './component/Modal';


const socket = io('http://localhost:3000', {
transports: ['websocket'], upgrade: false
});

function App() {
  const myUserName = localStorage.getItem('user');
  const [negotiate, setNegotiate] = useState(false)
  const [videoOffer, setVideoOffer] = useState({});
  const [videoAns, setVideoAnswer] = useState({});
  const [newCandidate, setNewCandidate] = useState({});
  const [calling, setCalling] = useState(false)
  // const [users, setUsers] = useState([]);
  const videoRef = useRef(null)
  const recievedVideo = useRef(null)

    let constraints = {
    video:true,
    audio:true
  }

      let myPeerConnection;
 

      const createPeerConnection = () => {
        let servers = 
        {
          iceServers: 
          [
              {urls: 'stun:stun.l.google.com:19302'}
          ]
       }
  
        myPeerConnection = new RTCPeerConnection(servers);
        myPeerConnection.onicecandidate = handleICECandidateEvent;
        myPeerConnection.ontrack = handleTrackEvent;
        myPeerConnection.onnegotiationneeded = handleNegotiationNeededEvent;
      } 

      const invite =  () => {
         createPeerConnection();

        navigator.mediaDevices.getUserMedia(constraints)
        .then((streams) => {
           const tracks = streams.getTracks();
           tracks.forEach(track => {
             myPeerConnection.addTrack(track, streams);
           })
             videoRef.current.srcObject = streams;
        })
        .catch((error) => {
          console.log(`error: ${error}`)
        })   
      }



      async function handleNegotiationNeededEvent() {

          myPeerConnection.createOffer()
          .then(offer => {
            myPeerConnection.setLocalDescription(offer)
              .then(() => {
                socket.emit('video-offer', {
                  sender: myUserName,
                  reciever: 'Subhan',
                  sdp: myPeerConnection.localDescription 
                 })     
              })
          })
          .catch((error) => {
            console.log(`error ${error}`)
          })
      }

      async function handleVideoOfferMsg() {
        
        let msg;
        let localStream = null;
        msg = videoOffer;
       
        createPeerConnection();
        const description = new RTCSessionDescription(msg.sdp);
  
        myPeerConnection.setRemoteDescription(description)
          .then(() => {
            navigator.mediaDevices.getUserMedia(constraints)
            .then((stream) => {
              localStream = stream;
              recievedVideo.current.srcObject = stream
              localStream.getTracks()
              .forEach((track) => {
                myPeerConnection.addTrack(track, localStream)
              });
            })
            .then(() => {
              myPeerConnection.createAnswer()
               .then((answer) => {
                console.log(answer)
                myPeerConnection.setLocalDescription(answer)
               })
               .then(() => {
                socket.emit('video-answer', {
                  sdp: myPeerConnection.localDescription,
                  name: 'mukesh'
                })
               
               })
               .catch((error) => {
                console.log(`error${error}`)
               })
            })
          })
          setCalling(true)
      }

      socket.on('offer', offer => {
        setVideoOffer(offer);
      })

    

      async function handleICECandidateEvent(event) {
          if(event.candidate) {
            socket.emit('new-ice-candidate', {
              candidate: event.candidate
            })
            setCalling(true)
          }
      }
           

      function handleNewICECandidateMsg(newCandidate) {
        
          const candidate = new RTCIceCandidate( newCandidate );
          
          myPeerConnection.addIceCandidate(candidate)
            .catch((error) => {
              console.log(`error ${error}`)
            })
      }


      socket.on('new-ice-candidate', recieved => {
        // console.log('recieved', recieved)
         setNewCandidate(recieved.candidate)
     })
     
     
        function handleTrackEvent(event) {

          console.log(event.streams[0])
          recievedVideo.current.srcObject = event.streams[0]
        }

      // useEffect(() => {

      //   const userJustVisited = prompt("Please Enter your Name...");
      //   localStorage.setItem('users', userJustVisited);
      // }, [])
  return (
    <>
    <h1>Video Chat App</h1>
    <video ref={videoRef}  playsInline autoPlay></video>
    <video ref={recievedVideo} playsInline autoPlay></video>
    <button onClick={invite}>Call</button>
    {
      calling ?
      <Modal caller={videoOffer.sender} handleSubmit={() => {
        handleVideoOfferMsg();
        handleNewICECandidateMsg(newCandidate) 
      }}/>
      : ''
    }
    </>
  )
}

export default App
