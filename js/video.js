

function hasGetUserMedia() {
    return navigator.webkitGetUserMedia;
}

var alertUserDoesntHaveWebRTCSupport = function (e) {
    alert('getUserMedia() is not supported in your browser');
};

function startVideo() {
        console.log("start clicked");

    navigator.webkitGetUserMedia({ "audio":false, "video":true }, function (localMediaStream) {

        var video = $('#myvideo');
        var myVideoStream = window.URL.createObjectURL(localMediaStream);
        video.attr('src', myVideoStream);
        startVideoAndAR(video[0]);
    });




}

function startVideoAndAR2(video){
    var canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    document.querySelector(".media").appendChild(canvas);

    // Create a RGB raster object for the 2D canvas.
// JSARToolKit uses raster objects to read image data.
// Note that you need to set canvas.changed = true on every frame.
    var raster = new NyARRgbRaster_Canvas2D(canvas);

// FLARParam is the thing used by FLARToolKit to set camera parameters.
// Here we create a FLARParam for images with 320x240 pixel dimensions.
    var param = new FLARParam(640, 480);

// The FLARMultiIdMarkerDetector is the actual detection engine for marker detection.
// It detects multiple ID markers. ID markers are special markers that encode a number.
    var detector = new FLARMultiIdMarkerDetector(param, 120);

// For tracking video set continue mode to true. In continue mode, the detector
// tracks markers across multiple frames.
    detector.setContinueMode(true);

// Copy the camera perspective matrix from the FLARParam to the WebGL library camera matrix.
// The second and third parameters determine the zNear and zFar planes for the perspective matrix.
    param.copyCameraMatrix(display.camera.perspectiveMatrix, 10, 10000);

    setInterval(function() {
        canvas.getContext('2d').drawImage(video, 0, 0, 640, 480);
        canvas.changed = true;
        var markerCount = detector.detectMarkerLite(raster, 190);


        // Create a NyARTransMatResult object for getting the marker translation matrices.
        var resultMat = new NyARTransMatResult();

        var markers = {};

// Go through the detected markers and get their IDs and transformation matrices.
        for (var idx = 0; idx < markerCount; idx++) {
            // Get the ID marker data for the current marker.
            // ID markers are special kind of markers that encode a number.
            // The bytes for the number are in the ID marker data.
            var id = detector.getIdMarkerData(idx);

            // Read bytes from the id packet.
            var currId = -1;
            // This code handles only 32-bit numbers or shorter.
            if (id.packetLength <= 4) {
                currId = 0;
                for (var i = 0; i < id.packetLength; i++) {
                    currId = (currId << 8) | id.getPacketData(i);
                }
            }

            // If this is a new id, let's start tracking it.
            if (markers[currId] == null) {
                markers[currId] = {};
            }
            // Get the transformation matrix for the detected marker.
            detector.getTransformMatrix(idx, resultMat);

            // Copy the result matrix into our marker tracker object.
            markers[currId].transform = Object.asCopy(resultMat);
        }
    },50);
}

function startVideoAndAR(video){

    var canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    var raster = new NyARRgbRaster_Canvas2D(canvas);
    canvas.id = "ar-canvas";
    document.querySelector(".media").appendChild(canvas);

    var param = new FLARParam(640,480);
    var pmat = mat4.identity();
    param.copyCameraMatrix(pmat, 100, 10000);

    var resultMat = new NyARTransMatResult();

    var detector = new FLARMultiIdMarkerDetector(param, 2);
    detector.setContinueMode(true);
    var frame = 0;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0,0,640,480);
    ctx.font = "24px URW Gothic L, Arial, Sans-serif";

    var times = [];
    var pastResults = {};
    setInterval(function() {
        if (video.paused) return;
        if (window.paused) return;

        updateCanvas(ctx, video);
        var dt = new Date().getTime();

        canvas.changed = true;

        var t = new Date();
        var detected = detector.detectMarkerLite(raster, 190);
        for (var idx = 0; idx<detected; idx++) {
            var id = detector.getIdMarkerData(idx);
            var currId;
            if (id.packetLength > 4) {
                currId = -1;
            }else{
                currId=0;
                for (var i = 0; i < id.packetLength; i++ ) {
                    currId = (currId << 8) | id.getPacketData(i);
                }
            }
            if (!pastResults[currId]) {
                pastResults[currId] = {};
            }
            detector.getTransformMatrix(idx, resultMat);
            pastResults[currId].age = 0;
            var mat = resultMat;
            var cm = mat4.create();
            cm[0] = mat.m00;
            cm[1] = -mat.m10;
            cm[2] = mat.m20;
            cm[3] = 0;
            cm[4] = mat.m01;
            cm[5] = -mat.m11;
            cm[6] = mat.m21;
            cm[7] = 0;
            cm[8] = -mat.m02;
            cm[9] = mat.m12;
            cm[10] = -mat.m22;
            cm[11] = 0;
            cm[12] = mat.m03;
            cm[13] = -mat.m13;
            cm[14] = mat.m23;
            cm[15] = 1;
            mat4.multiply(pmat, cm, cm);

            var zrotation = Math.atan2(cm[0], cm[4]);
            //console.log("id ", id);

            if(id._check == 1){

                var min = 0.1
                var max  = 2;
                var clampedVal = Math.min(1, Math.max(0, Math.abs((zrotation*2) / Math.PI)));
                var actualRotationValueToProvide = min + (max - min) * clampedVal;

                radio("Audio:filter").broadcast({filter: 'filter-1',
                    value: actualRotationValueToProvide});

                radio("Controls:filter").broadcast({
                    filter: "filter-1",
                    value: actualRotationValueToProvide
                });
            }
            if(id._check == 2){

                var min = 1
                var max  = 30;
                var clampedVal = Math.min(1, Math.max(0, Math.abs((zrotation*2) / Math.PI)));
                var actualRotationValueToProvide = min + (max - min) * clampedVal;
                radio("Audio:filter").broadcast({filter: 'filter-2',
                    value: actualRotationValueToProvide});

                radio("Controls:filter").broadcast({
                    filter: "filter-2",
                    value: actualRotationValueToProvide
                });
            }
            if(id._check == 3){

                var min = 0.1;
                var max  = 1;
                var clampedVal = Math.min(1, Math.max(0, Math.abs((zrotation*2) / Math.PI)));
                var actualRotationValueToProvide = min + (max - min) * clampedVal;
                radio("Audio:filter").broadcast({filter: 'filter-3',
                    value: actualRotationValueToProvide});

                radio("Controls:filter").broadcast({
                    filter: "filter-3",
                    value: actualRotationValueToProvide
                });
            }
            pastResults[currId].transform = cm;
            if (idx == 0) times.push(new Date()-t);
        }
        for (var i in pastResults) {
            var r = pastResults[i];
            if (r.age > 10) delete pastResults[i];
            r.age++;
        }
        var w2 = 640/2;
        var h2 = 480/2;
        for (var i in pastResults) {
            var mat = pastResults[i].transform;
            var verts = [
                vec4.create(-1, -1, 0, 1),
                vec4.create(1, -1, 0, 1),
                vec4.create(1, 1, 0, 1),
                vec4.create(-1, 1, 0, 1) ];
            var verts2 = [
                vec4.create(-0.8, -0.8, 0, 1),
                vec4.create(-0.2, -0.8, 0, 1),
                vec4.create(-0.2, -0.2, 0, 1),
                vec4.create(-0.8, -0.2, 0, 1) ];
            ctx.save();
            ctx.beginPath();
            verts.forEach(function(v,i) {
                mat4.multiplyVec4(mat, v);
                v[0] = v[0]*w2/v[3] + w2;
                v[1] = -v[1]*h2/v[3] + h2;
                if (i) {
                    ctx.lineTo(v[0], v[1]);
                } else {
                    ctx.moveTo(v[0], v[1]);
                }
            });
            ctx.closePath()
            ctx.fillStyle = "red";
            ctx.fill();
            ctx.beginPath();
            verts2.forEach(function(v,i) {
                mat4.multiplyVec4(mat, v);
                v[0] = v[0]*w2/v[3] + w2;
                v[1] = -v[1]*h2/v[3] + h2;
                if (i) {
                    ctx.lineTo(v[0], v[1]);
                } else {
                    ctx.moveTo(v[0], v[1]);
                }
            });
            ctx.closePath()
            ctx.fillStyle = "white";
            ctx.fill();
            ctx.restore();
        }
        if (detected == 0) times.push(new Date()-t);
        if (times.length > 100) {
            if (window.console)
                console.log(times.reduce(function(s,i){return s+i;})/times.length)
            times.splice(0);
        }
    }, 50);

}

function updateCanvas(ctx, video) {
    ctx.drawImage(video, 0,0,640,480);
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



