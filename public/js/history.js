var socket = io();
var img = document.getElementById("play");
var button = document.getElementById('start');

function onBtnStartClicked() {
    socket.emit('historyReq');
    //  button.disabled = true;
}

socket.on('historyData', function(image) {
    var imgData = pako.inflate(image, { to: 'string' });
    console.log(imgData);
    img.src = imgData;
});

socket.on('finish', function() {
    button.disabled = false;
})


// var socket = io();
// var img = document.getElementById("play");
// var dataElement = document.getElementById('demo');
// var button = document.getElementById('start');

// function onBtnStartClicked(){
// 	dataElement.innerHTML = "hello world";
// 	socket.emit('ready');
//     button.disabled = true;
// }

// socket.on('stream', function(image){
//     var img = document.getElementById("play");
//     img.src = image;
// });

// socket.on('finish', function(){
//    button.disabled = false; 
// })