
var socket = io();
var img = document.getElementById("play");

socket.on('connect', function(){
	socket.emit('add subscriber', prompt("Enter token"));
});

socket.on('stream', function(image){
    var img = document.getElementById("play");
    img.src = image;
});

socket.on('terror', function(data){
    alert(data);   
    socket.emit('add subscriber', prompt("Enter token"));
});
