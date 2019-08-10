'use strict';

var isChannelReady = false;
var isInitiator = false;
var isStarted = false;
var localStream;
var pc;
var remoteStream;
var turnReady;
var clickedJoin = false;
var pcConfig = {
  'iceServers': [{
    'urls': 'stun:stun.l.google.com:19302'
  }]
};

var roomPeer = []
var pc0,pc1,pc2,pc3,pc4,pc5,pc6,pc7,pc8,pc9
var pcList =[pc0,pc1,pc2,pc3,pc4,pc5,pc6,pc7,pc8,pc9]
var offerName = []
var connectingName
var startConnection=[]
// Set up audio and video regardless of what devices are present.
var sdpConstraints = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true
};

// setup send function
// rtc_name : undefined
function sendMessage(message) {
  //console.log('Client sending message: ', message);
  chatSocket.send(JSON.stringify({
            'message': message,
            'type':'webrtc',
            'rtc_name':'test'
        }));
}

// This client receives a message

chatSocket.onmessage = function(e) {
  var data = JSON.parse(e.data);
    var message = data['message'];
    console.log('Client received message:', data);
    if (message === 'got user media') {
      //maybeStart();
      console.log("receive got user media : "+ data['from_user'])
      if (roomPeer.indexOf(data['from_user']) >= 0 ){
          console.log("Already Created : "+ data['from_user'])
        }else{
          roomPeer.push(data['from_user'])
          console.log(">>>>>>>>>>>>>creating peer connetion : "+ data['from_user'])
          connectingName = data['from_user']
          sendMessage('createPeerConnection')
          createPeerConnection()
        }
    } else if(message === 'createPeerConnection'){
      if (roomPeer.indexOf(data['from_user']) >= 0 ){
        console.log("Receive CreatePeerConnection , Already Created : "+ data['from_user'])
      }else{
        roomPeer.push(data['from_user'])
        connectingName = data['from_user']
        console.log("Receive CreatePeerConnection >>>>>>>>>>>>creating peer connetion : "+ data['from_user'])
        createPeerConnection()
      }
    }else if (message.type === 'offer' && clickedJoin) {
      if(username !== data['from_user']) {
        //if (!isInitiator && !isStarted) {
        if (!isInitiator) {
          //maybeStart();
        }
        if(startConnection.indexOf(data['from_user']) <0 ) {
          console.log("switch to " + data['from_user'])
          connectingName = data['from_user']
          var tmpSessionDes = new RTCSessionDescription(message)
          pcList[roomPeer.indexOf(data['from_user'])].setRemoteDescription(tmpSessionDes);
          doAnswer();
        }
      }
    //} else if (message.type === 'answer' && isStarted && clickedJoin) {
    } else if (message.type === 'answer' && clickedJoin) {
      if(username !== data['from_user'] && startConnection.indexOf(data['from_user'])<0) {
        console.log("switch to "+ data['from_user'])
        connectingName = data['from_user']
        var tmpSessionDes = new RTCSessionDescription(message)
        pcList[roomPeer.indexOf(data['from_user'])].setRemoteDescription(tmpSessionDes);
        maybeStart()
      }
    //} else if (message.type === 'candidate' && isStarted && clickedJoin) {
    } else if (message.type === 'candidate' && clickedJoin) {
      if(username !== data['from_user'] && startConnection.indexOf(data['from_user']) < 0 ) {
        var candidate = new RTCIceCandidate({
          sdpMLineIndex: message.label,
          candidate: message.candidate
        });
        console.log("switch to "+ data['from_user'])
        connectingName = data['from_user']
        pcList[roomPeer.indexOf(data['from_user'])].addIceCandidate(candidate);

      }else{
        console.log(">>>>>>>>>>>jump")
      }
    //} else if (message === 'bye' && isStarted && clickedJoin) {
    } else if (message === 'bye' && clickedJoin) {
      handleRemoteHangup();

    } else if (message === "create_or_join") {
      console.log(data["create_or_join"])
      console.log("switch to "+ data['from_user'])
      connectingName = data['from_user']
      if (data["create_or_join"] === "create") {
        isInitiator = true
        maybeStart()
      } else {
        isChannelReady = true
        maybeStart()
      }
      if(data["active"] >2 && data["from_user"] != username){
        isInitiator = true
      }
    }
};

////////////////////////////////////////////////////

var localVideo = document.querySelector('#main_video');
var remoteVideo = document.querySelector('#second_video');
var remoteVideoSecond = document.querySelector('#third_video');
var connectNum =0

/*
function switchPc(userName){
  if (roomPeer.indexOf(userName) >= 0 ){
    pc = pcList[roomPeer.indexOf(userName)]
    console.log("switch to "+ userName)
  }else{
    roomPeer.push(userName)
    console.log("switch to "+userName)
    pc = pcList[roomPeer.indexOf(userName)]
  }
}
*/


function join_chat()
{
  sendMessage("create_or_join")
  $("#join_button").css({display:"none"})
  clickedJoin = true
}
  navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true
  })
      .then(gotStream)
      .catch(function (e) {
        alert('getUserMedia() error: ' + e.name);
      });

function gotStream(stream) {
  console.log('Adding local stream.');
  localStream = stream;
  localVideo.srcObject = stream;
  sendMessage('got user media');
  if (isInitiator) {
    maybeStart();
  }
}

var constraints = {
  video: true
};

console.log('Getting user media with constraints', constraints);

if (location.hostname !== 'localhost') {
  requestTurn(
    'https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913'
  );
}

function maybeStart() {
  //console.log('>>>>>>> maybeStart() ', isStarted, localStream, isChannelReady);
  //if (!isStarted && typeof localStream !== 'undefined' && isChannelReady) {
  console.log('>>>>>>> maybeStart() ',  localStream, isChannelReady);
  if (typeof localStream !== 'undefined' && isChannelReady) {
    console.log('>>>>>> creating peer connection');
    createPeerConnection();
    pcList[roomPeer.indexOf(connectingName)].addStream(localStream);
    //isStarted = true;
    console.log('isInitiator', isInitiator);
    if (isInitiator) {
      console.log("DO CALL")
      doCall();
    }
  }
}

window.onbeforeunload = function() {
  sendMessage('bye');
};


function createPeerConnection() {
  try {
    console.log("trying to create peer connection : "+connectingName)
    pcList[roomPeer.indexOf(connectingName)] = new RTCPeerConnection(pcConfig);
    pcList[roomPeer.indexOf(connectingName)].onicecandidate = handleIceCandidate;
    pcList[roomPeer.indexOf(connectingName)].onaddstream = handleRemoteStreamAdded;
    pcList[roomPeer.indexOf(connectingName)].onremovestream = handleRemoteStreamRemoved;
    console.log('Created RTCPeerConnnection');
  } catch (e) {
    console.log('Failed to create PeerConnection, exception: ' + e.message);
    alert('Cannot create RTCPeerConnection object.');
    return;
  }
}

function handleIceCandidate(event) {
  console.log("trying to send candidate")
  if (event.candidate && startConnection.indexOf(connectingName)<0) {
    console.log("sending candidate")
    sendMessage({
      type: 'candidate',
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate
    });
  } else {
    console.log('End of candidates.');
  }
}

function handleCreateOfferError(event) {
  console.log('createOffer() error: ', event);
}

function doCall() {
  console.log('Sending offer to peer');
  console.log("switching to "+ connectingName)
  pcList[roomPeer.indexOf(connectingName)].createOffer(setLocalAndSendMessage, handleCreateOfferError);
}

function doAnswer() {
  console.log('Sending answer to peer.');
  pcList[roomPeer.indexOf(connectingName)].createAnswer().then(
    setLocalAndSendMessage,
    onCreateSessionDescriptionError
  );
}

function setLocalAndSendMessage(sessionDescription) {
  pcList[roomPeer.indexOf(connectingName)].setLocalDescription(sessionDescription);
  console.log('setLocalAndSendMessage sending message', sessionDescription);
  sendMessage(sessionDescription);
}

function onCreateSessionDescriptionError(error) {
  console.log('Failed to create session description: ' + error.toString());
}

function requestTurn(turnURL) {
  var turnExists = false;
  for (var i in pcConfig.iceServers) {
    if (pcConfig.iceServers[i].urls.substr(0, 5) === 'turn:') {
      turnExists = true;
      turnReady = true;
      break;
    }
  }
  if (!turnExists) {
    console.log('Getting TURN server from ', turnURL);
    // No TURN server. Get one from computeengineondemand.appspot.com:
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status === 200) {
        var turnServer = JSON.parse(xhr.responseText);
        console.log('Got TURN server: ', turnServer);
        pcConfig.iceServers.push({
          'urls': 'turn:' + turnServer.username + '@' + turnServer.turn,
          'credential': turnServer.password
        });
        turnReady = true;
      }
    };
    xhr.open('GET', turnURL, true);
    xhr.send();
  }
}

function handleRemoteStreamAdded(event) {
  console.log('Remote stream added.');
  remoteStream = event.stream;
  startConnection.push(connectingName)
  if(connectNum == 0){
    remoteVideo.srcObject = remoteStream;
    connectNum +=1
  }else{
    remoteVideoSecond.srcObject = remoteStream;
  }
}

function handleRemoteStreamRemoved(event) {
  console.log('Remote stream removed. Event: ', event);
}

function hangup() {
  console.log('Hanging up.');
  stop();
  sendMessage('bye');
}

function handleRemoteHangup() {
  console.log('Session terminated.');
  isInitiator = false;
  stop();
}

function stop() {
  //isStarted = false;
  //console.log("isStarted",isStarted)
  console.log("isInitiator",isInitiator)
  pcList[roomPeer.indexOf(connectingName)].close();
  pcList[roomPeer.indexOf(connectingName)] = null;
  startConnection[roomPeer.indexOf(connectingName)]=""
  roomPeer[roomPeer.indexOf(connectingName)] = ""
}