$(function() {
    // Handler for .ready() called.
    // Listen for things on the "info" channel
    radio("info").subscribe(function (msg) { console.info('info', msg); });
    bringUpVideo();
});

