var socket = io();
var img = document.getElementById("play");
var chunk1 = [];
var chunk2 = [];
var img;

socket.on('connect', function() {
    socket.emit('add subscriber', prompt("Enter token"));
});

socket.on('stream', function(image){
    chunk2.push(image);
});

dispImages(0);

function dispImages(i){
    var s = setTimeout(function () {   
	    if(chunk1.length==100 && i<=100){
            img = document.getElementById("play");
            img.src = chunk1[i];
	        i++;
    	    dispImages(i);
	    }  
        else if(chunk2.length<100){
            dispImages(i);
        }
        else {
            chunk1 = chunk2.splice(0,100);
            dispImages(0);
        }
    }, 100);
}

socket.on('tokenError', function(data) {
    alert(data);
    socket.emit('add subscriber', prompt("Enter token"));
});