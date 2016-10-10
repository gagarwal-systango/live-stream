var socket = io();
var img = document.getElementById("play");
var chunk1 = [];
var chunk2 = [];
var img;
var start = true;

socket.on('connect', function() {
    socket.emit('add subscriber', prompt("Enter token"));
});

socket.on('stream', function(image) {
    var imgData = pako.inflate(image, { to: 'string' });
    img.src = imgData;
});

socket.on('tokenError', function(data) {
    alert(data);
    socket.emit('add subscriber', prompt("Enter token"));
});