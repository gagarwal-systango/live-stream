var socket = io();
var img = document.getElementById("play");
var chunk1 = [];
var chunk2 = [];
var img;
var start = true;

socket.on('connect', function() {
    socket.emit('add subscriber', prompt("Enter token"));
});

socket.on('stream', function(image){
    chunk2.push(image);
    if(chunk2.length>40 && start){
        dispImages(0);
        start = false;
    }
});

//dispImages(0);

function dispImages(i){
    var s = setTimeout(function () {   
	    if(chunk1.length>=5 && i<5){
            img = document.getElementById("play");
            img.src = chunk1[i];
	        i++;
    	    dispImages(i);
	    }  
        else if(chunk1.length==5 && chunk2.length<5){
            img.src = chunk1[4];
            dispImages(i);
        }
        else if(chunk2.length<5){
            dispImages(i);
        }
        else {
            chunk1 = chunk2.splice(0,5);
            dispImages(0);
        }
    }, 100);
}

socket.on('tokenError', function(data) {
    alert(data);
    socket.emit('add subscriber', prompt("Enter token"));
});