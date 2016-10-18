var socket = io();
var img = document.getElementById("play");
var chunk1 = [];
var chunk2 = [];

var start = true;

socket.on('connect', function() {
    socket.emit('add subscriber', prompt("Enter token"));
});

socket.on('stream', function(data) {
    console.log('before'+data);
    var imgData = pako.inflate(data, { to: 'string' });
   console.log('after'+imgData);
     
    img.src = imgData;
});
socket.on('stream1', function(audioData) {
   
     if (audioData !== null && audioData !== undefined) {
        var audioInfo = audioData;
        console.log("id:=" + audioInfo.id + "Position:= " + audioInfo.playingPosition);
    }
    
});
socket.on('tokenError', function(data) {
    alert(data);
    socket.emit('add subscriber', prompt("Enter token"));
});