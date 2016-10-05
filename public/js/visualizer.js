var socket = io();
var img = document.getElementById("play");

socket.on('connect', function() {
    socket.emit('add subscriber', prompt("Enter token"));
});

socket.on('stream', function(image) {
    // get data from server.
    var img = document.getElementById("play");
    img.src = image;
});

socket.on('tokenError', function(data) {
    alert(data);
    socket.emit('add subscriber', prompt("Enter token"));
});