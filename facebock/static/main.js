'use strict';

var isChannelReady = false;
var isInitiator = false;
var isStarted = false;
var localStream;
var pc;
var remoteStream;
var turnReady;

var pcConfig = {
  'iceServers': [{
    'urls': 'stun:stun.l.google.com:19302'
  }]
};

// Set up audio and video regardless of what devices are present.
var sdpConstraints = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true
};

// setup send function
// rtc_name : undefined
function sendMessage(message) {
  console.log('Client sending message: ', message);
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
      if(data['from_user'] != username){
        $("#join_button").css("display","block")
      }
    } else if (message.type === 'offer') {
      if(username !== data['from_user']) {
        if (!isInitiator && !isStarted) {
          maybeStart();
        }
        pc.setRemoteDescription(new RTCSessionDescription(message));
        doAnswer();
      }
    } else if (message.type === 'answer' && isStarted) {
      if(username !== data['from_user']) {
        pc.setRemoteDescription(new RTCSessionDescription(message));
      }
    } else if (message.type === 'candidate' && isStarted) {
      var candidate = new RTCIceCandidate({
        sdpMLineIndex: message.label,
        candidate: message.candidate
      });
      pc.addIceCandidate(candidate);
    } else if (message === 'bye' && isStarted) {
      handleRemoteHangup();
      isInitiator = true
    } else if (message === "create_or_join") {
      console.log(data["create_or_join"])
      if (data["create_or_join"] === "create" && data['from_user'] !==username) {
        isInitiator = true
        $("#join_button").css("display","block")
      } else {
        isChannelReady = true
        maybeStart()
      }
    }
};


////////////////////////////////////////////////////

var localVideo = document.querySelector('#main_video');
var remoteVideo = document.querySelector('#second_video');

function join_chat()
{
  sendMessage("create_or_join")
  $("#join_button").remove()
}
  navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true
  })
      .then(gotStream)
      .catch(function (e) {
        console.log('getUserMedia() error: ' + e.name);
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
  console.log('>>>>>>> maybeStart() ', isStarted, localStream, isChannelReady);
  if (!isStarted && typeof localStream !== 'undefined' && isChannelReady) {
    console.log('>>>>>> creating peer connection');
    createPeerConnection();
    pc.addStream(localStream);
    isStarted = true;
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
    pc = new RTCPeerConnection(pcConfig);
    pc.onicecandidate = handleIceCandidate;
    pc.onaddstream = handleRemoteStreamAdded;
    pc.onremovestream = handleRemoteStreamRemoved;
    console.log('Created RTCPeerConnnection');
  } catch (e) {
    console.log('Failed to create PeerConnection, exception: ' + e.message);
    alert('Cannot create RTCPeerConnection object.');
    return;
  }
}

function handleIceCandidate(event) {
  if (event.candidate) {
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
  pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
}

function doAnswer() {
  console.log('Sending answer to peer.');
  pc.createAnswer().then(
    setLocalAndSendMessage,
    onCreateSessionDescriptionError
  );
}

function setLocalAndSendMessage(sessionDescription) {
  pc.setLocalDescription(sessionDescription);
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
  remoteVideo.srcObject = remoteStream;
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
  isStarted = false;
  console.log("isStarted",isStarted)
  console.log("isInitiator",isInitiator)
  pc.close();
  pc = null;
}


