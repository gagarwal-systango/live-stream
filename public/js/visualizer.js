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
    chunk2.push(imgData);
    if (chunk2.length > 10) {
        img.src = chunk2.shift;
    }

});

//dispImages(0);

function dispImages(i) {
    var s = setTimeout(function() {
        if (chunk1.length >= 5 && i < 5) {
            img = document.getElementById("play");
            img.src = chunk1[i];
            i++;
            dispImages(i);
        } else if (chunk1.length == 5 && chunk2.length < 5) {
            img.src = chunk1[4];
            dispImages(i);
        } else if (chunk2.length < 5) {
            dispImages(i);
        } else {
            chunk1 = chunk2.splice(0, 5);
            dispImages(0);
        }
    }, 100);
}

socket.on('tokenError', function(data) {
    alert(data);
    socket.emit('add subscriber', prompt("Enter token"));
});