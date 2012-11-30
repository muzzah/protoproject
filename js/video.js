function hasGetUserMedia() {
    // Note: Opera is unprefixed.
    return navigator.webkitGetUserMedia;
}

var onFailSoHard = function(e) {
    alert('getUserMedia() is not supported in your browser');
};

function bringUpVideo(){

    if (hasGetUserMedia()) {

        // Not showing vendor prefixes.
        navigator.webkitGetUserMedia({video: true, audio: false}, function(localMediaStream) {
            var video = document.querySelector('video');
            video.src = window.URL.createObjectURL(localMediaStream);

            // Note: onloadedmetadata doesn't fire in Chrome when using it with getUserMedia.
            // See crbug.com/110938.
            video.onloadedmetadata = function(e) {
                // Ready to go. Do some stuff.
            };
        }, onFailSoHard);

    } else {
        onFailSoHard();
    }
}




