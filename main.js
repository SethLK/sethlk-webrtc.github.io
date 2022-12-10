let peerConnection; //connect webrtc

let localStream; //your computer
let remoteStream; //other computer

//servers for webrtc connection
let servers = {
  iceServers:[
    {
      urls:['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
    }
  ]
}

let init = async () => { //start room
  localStream = await navigator.mediaDevices.getUserMedia({video:true, audio:true})

  document.getElementById('user-1').srcObject = localStream;
}

let createPeerConnection = async (sdpType)=> {
  peerConnection = new RTCPeerConnection(servers)

  remoteStream = new MediaStream();
  document.getElementById('user-2').srcObject = remoteStream;

  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream)
})

  peerConnection.ontrack = async (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track)
    })
  }

  peerConnection.onicecandidate = async (event) => {
    if(event.candidate){
      document.getElementById(sdpType).value = JSON.stringify(peerConnection.localDescription)
    }
  }

}

let createOffer = async () => { // create offer for entry
  createPeerConnection('offer-sdp')

  let offer = await peerConnection.createOffer()
  await peerConnection.setLocalDescription(offer)

  document.getElementById('offer-sdp').value = JSON.stringify(offer)
}

let createAnswer = async () => {
  createPeerConnection('answer-sdp')

  let offer = document.getElementById('offer-sdp').value
  if(!offer) return alert('Retrieve offer from peer first')

  offer = JSON.parse(offer)
  await peerConnection.setRemoteDescription(offer)

  let answer = await peerConnection.createAnswer()
  await peerConnection.setLocalDescription(answer)

  document.getElementById('answer-sdp').value = JSON.stringify(answer)
}

let addAnswer = async () =>{
  let answer = document.getElementById('answer-sdp').value;
  if(!answer) return alert('Retrieve answer from peer first....')

  answer = JSON.parse(answer)

  if(!peerConnection.currentRemoteDescription){
    peerConnection.setRemoteDescription(answer)
  }
}

init()

document.getElementById('create_offer').addEventListener('click', createOffer)
document.getElementById('create_answer').addEventListener('click', createAnswer)
document.getElementById('add_answer').addEventListener('click', addAnswer)