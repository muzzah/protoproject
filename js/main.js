var signallingChannel;
var settings = {
    apikey:'455f08c6-2ee9-4f75-819c-1229744bfda8',
    channel:'video'
};

$(function() {
    // Handler for .ready() called.
    // Listen for things on the "info" channel
    radio("info").subscribe(function (msg) { console.info('info', msg); });
    setupPubSub();


    var audioDisabled = function() {
        $(".ui-components").addClass("disabled");
        $(".slider input").attr({disabled: 'disabled'})
    };

    var audioEnabled = function() {
        $(".ui-components").removeClass("disabled");
        $(".slider input").attr({disabled: false});
    };

    /* Playing of audio if initiated by the user, therefore we should disable audio controls at the start */
    audioDisabled();

    $("#start").click(function () {
        startVideo();
        startAudio();
        audioEnabled();
    });
});

function setupPubSub(){
    signallingChannel = new jXSockets.WebSocket("ws://xsocketslive.cloudapp.net:10101/XSockets.Live.Realtime.API",
        "XSockets.Live.Realtime.API", settings);

    // Fires when a connection is established
    signallingChannel.bind(XSockets.Events.open, function (message) {
        console.log("open to xsockets");
    });

// Fires when a connection is closed by the server
    signallingChannel.bind(XSockets.Events.close, function (message) {
        console.log("close to xsockets");
    });


// Fires when a error is sent from the server
    signallingChannel.bind(XSockets.Events.onError, function (error) {
        console.log("Error on xsockets ", error);
    });

    // Subscribe to "foo"
    signallingChannel.bind(settings.channel, processSignal);
}

