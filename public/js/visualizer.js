var socket = io();
var img = document.getElementById("play");
var chunk1 = [];
var chunk2 = [];

var start = true;

socket.on('connect', function() {
    socket.emit('add subscriber', prompt("please open your spotify and then Enter token"));
});

socket.on('stream', function(image){
    
   var imgData = pako.inflate(image, { to: 'string' });
   chunk2.push(imgData);
});

dispImages(0);

function dispImages(i){
    var s = setTimeout(function () {   
	    if(chunk1.length>=5 && i<5){
            
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
var songid = null;
socket.on('stream1', function(audioData) {   
   if (audioData !== null && audioData !== undefined) {
      console.log("id:=" + audioData.id + "Position:= " + audioData.playingPosition);
         if(songid===null || songid!==audioData.id){
           var songid = audioData.id;
           var url =audioData.id;
            console.log('playing : '+ url);
           socket.emit('changesong', url);
         }
    }  
});
//+'#'+audioData.playingPosition

socket.on('tokenError', function(data) {
    alert(data);
    socket.emit('add subscriber', prompt("Please open your spotify and then enter token"));
});
var max= document.getElementById('max');
var min= document.getElementById('min');


function fullsize() {    
  $('.main').removeClass('min_image');
  img.style.height='100%';
  img.style.width='100%';
  max.style.display="none";
  min.style.display = "block"; 
  }

function minimize() {    
  $('.main').addClass('min_image');
  min.style.display="none";
  max.style.display = "block";
 }

