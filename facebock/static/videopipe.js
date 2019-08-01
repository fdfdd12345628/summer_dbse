
function errorHandler(context) {
  return function(error) {
    trace('Failure in ' + context + ': ' + error.toString);
  };
}

// eslint-disable-next-line no-unused-vars
function successHandler(context) {
  return function() {
    trace('Success in ' + context);
  };
}

function noAction() {
}


let servers = null;
let pc1 = new RTCPeerConnection(servers);
let pc2 = new RTCPeerConnection(servers);
function VideoPipe(stream, handler) {
  console.log(pc1)
  console.log(pc2)
  pc1.addStream(stream);
  pc1.onicecandidate = function(event) {
    if (event.candidate) {
      pc2.addIceCandidate(new RTCIceCandidate(event.candidate),
                          noAction, errorHandler('AddIceCandidate'));
    }
  };
  pc2.onicecandidate = function(event) {
    if (event.candidate) {
      pc1.addIceCandidate(new RTCIceCandidate(event.candidate),
                          noAction, errorHandler('AddIceCandidate'));
    }
  };
  pc2.onaddstream = function(e) {
    handler(e.stream);
  };

  pc1.createOffer(function(desc) {
    pc1.setLocalDescription(desc);
    pc2.setRemoteDescription(desc);
    pc2.createAnswer(function(desc2) {
      pc2.setLocalDescription(desc2);
      pc1.setRemoteDescription(desc2);
    }, errorHandler('pc2.createAnswer'));
  }, errorHandler('pc1.createOffer'));
  this.pc1 = pc1;
  this.pc2 = pc2;

  console.log(pc1.getTransceivers())
}

VideoPipe.prototype.close = function() {
  this.pc1.close();
  this.pc2.close();
};