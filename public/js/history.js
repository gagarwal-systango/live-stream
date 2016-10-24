var socket = io();
var img = document.getElementById("play");

socket.emit('historyReq');

socket.on('historyData', function(image) {
    var imgData = pako.inflate(image, { to: 'string' });
    console.log(imgData);
    img.src = imgData;
});

socket.on('finish', function() {
    button.disabled = false;
})


