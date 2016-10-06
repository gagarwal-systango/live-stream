var socket = io();
var img = document.getElementById("play");
var chunk = [];

socket.on('connect', function() {
    socket.emit('add subscriber', prompt("Enter token"));
});

socket.on('stream', function(image){
    chunk.push(image);
    if(chunk.length>20){
        var img = document.getElementById("play");
        img.src = chunk.shift();    
    }
});

socket.on('tokenError', function(data) {
    alert(data);
    socket.emit('add subscriber', prompt("Enter token"));
});