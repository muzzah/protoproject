

function hasGetUserMedia() {
    return navigator.webkitGetUserMedia;
}

var alertUserDoesntHaveWebRTCSupport = function (e) {
    alert('getUserMedia() is not supported in your browser');
};

function startClicked() {
        console.log("start clicked");

    navigator.webkitGetUserMedia({ "audio":false, "video":true }, function (localMediaStream) {

        var video = $('#myvideo');
        var myVideoStream = window.URL.createObjectURL(localMediaStream);
        video.attr('src', myVideoStream);

    });




}


function processSignal(message) {
    console.log("message received", message);
}


function setupPeerConnection(){
//            pc = new RTCPeerConnection(null);
//
//        // send any ice candidates to the other peer
//        pc.onicecandidate = function (evt) {
//            signalingChannel.trigger(settings.channel, {
//                message:JSON.stringify({ "candidate":evt.candidate })
//            });
//        };
//
//        // once remote stream arrives, show it in the remote video element
//        pc.onaddstream = function (evt) {
//            //remoteView.src = URL.createObjectURL(evt.stream);
//        };
//
//
//        // get the local stream, show it in the local video element and send it
//        navigator.getUserMedia({ "audio":true, "video":true }, function (localMediaStream) {
//
//            var video = $('#myvideo');
//            var myVideoStream = window.URL.createObjectURL(localMediaStream);
//            video.attr('src', myVideoStream);
//            pc.addStream(stream);
//
//            if (isCaller)
//                pc.createOffer(gotDescription);
//            else
//                pc.createAnswer(pc.remoteDescription, gotDescription);
//
//            function gotDescription(desc) {
//                pc.setLocalDescription(desc);
//                signalingChannel.send(JSON.stringify({ "sdp":desc }));
//            }
//        });
//    }
//
//    signalingChannel.onmessage = function (evt) {
//        if (!pc)
//            start(false);
//
//        var signal = JSON.parse(evt.data);
//        if (signal.sdp)
//            pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
//        else
//            pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
//    };
}



