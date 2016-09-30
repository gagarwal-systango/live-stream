'use strict';

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia
		|| navigator.mozGetUserMedia || navigator.msGetUserMedia;

var videoSelect = document.querySelector('select#videoSource');

var videoSource = videoSelect.value;

if (getBrowser() == "Chrome") {
	var constraints = {
		"audio" : false,
		"video" : {
			"mandatory" : {
				"minWidth" : 320,
				"maxWidth" : 320,
				"minHeight" : 240,
				"maxHeight" : 240
			},
			"optional" : [ {
				sourceId : videoSource
			} ]
		}
	};// Chrome
} else if (getBrowser() == "Firefox") {
	var constraints = {
		audio : false,
		video : {
			width : {
				min : 320,
				ideal : 320,
				max : 1280
			},
			height : {
				min : 240,
				ideal : 240,
				max : 720
			},
			frameRate : {
				max : 128,
				ideal : 24
			}
		}
	}; // Firefox
}

var socket = io();
videoSelect.onchange = function() {
	videoSource = videoSelect.value
	if (getBrowser() == "Chrome") {
		constraints = {
			"audio" : false,
			"video" : {
				"mandatory" : {
					"minWidth" : 320,
					"maxWidth" : 320,
					"minHeight" : 240,
					"maxHeight" : 240
				},
				"optional" : [ {
					sourceId : videoSource
				} ]
			}
		};// Chrome
	}
	onBtnRecordClicked();
};

socket.on('connect', function(){
	// call the server-side function 'adduser' and send one parameter (value of prompt)
	socket.emit('add publisher');
});

var recBtn = document.querySelector('button#rec');
var video = document.getElementById('home');
var canvas = document.getElementById('preview');
var context = canvas.getContext('2d');

canvas.width = 320;
canvas.height = 240;

context.width = canvas.width;
context.height = canvas.height;

video.controls = false;

function gotSources(sourceInfos) {
	for (var i = 0; i !== sourceInfos.length; ++i) {
		var sourceInfo = sourceInfos[i];
		var option = document.createElement('option');
		option.value = sourceInfo.id;
		if (sourceInfo.kind === 'video') {
			option.text = sourceInfo.label || 'camera ' + (videoSelect.length + 1);
			videoSelect.appendChild(option);
		} else {
			console.log('Some other kind of source: ', sourceInfo);
		}
	}
}

if (typeof MediaStreamTrack !== 'undefined'
		|| typeof MediaStreamTrack.getSources !== 'undefined') {
	MediaStreamTrack.getSources(gotSources);
}

function errorCallback(error) {
	console.log('navigator.getUserMedia error: ', error);
}

function myLoop() {
	setInterval(function() {
		draw(video, context, context.width, context.height);
	}, 100);
}

function draw(v, c, cw, ch) {
	c.drawImage(v, 0, 0, cw, ch);
	// image/png by default
	var stringData = canvas.toDataURL('image/jpeg', 0.5);
	socket.emit('image', stringData);
}

function successCallback(stream) {
	window.stream = stream; // make stream available to console
	video.src = window.URL.createObjectURL(stream);
	video.play();
}

function onBtnRecordClicked() {
	if (typeof MediaRecorder === 'undefined' || !navigator.getUserMedia) {
		alert('MediaRecorder not supported on your browser, use Firefox 30 or Chrome 49 instead.');
	} else {
		if (window.stream) {
			video.src = null;
			window.stream.getVideoTracks()[0].stop();
			// window.stream.stop();
		}
		navigator.getUserMedia(constraints, successCallback, errorCallback);
		myLoop();
		recBtn.disabled = true;
	}
}

function log(message) {
	dataElement.innerHTML = dataElement.innerHTML + '<br>' + message;
}

// browser ID
function getBrowser() {
	var nVer = navigator.appVersion;
	var nAgt = navigator.userAgent;
	var browserName = navigator.appName;
	var fullVersion = '' + parseFloat(navigator.appVersion);
	var majorVersion = parseInt(navigator.appVersion, 10);
	var nameOffset, verOffset, ix;

	// In Opera, the true version is after "Opera" or after "Version"
	if ((verOffset = nAgt.indexOf("Opera")) != -1) {
		browserName = "Opera";
		fullVersion = nAgt.substring(verOffset + 6);
		if ((verOffset = nAgt.indexOf("Version")) != -1)
			fullVersion = nAgt.substring(verOffset + 8);
	}
	// In MSIE, the true version is after "MSIE" in userAgent
	else if ((verOffset = nAgt.indexOf("MSIE")) != -1) {
		browserName = "Microsoft Internet Explorer";
		fullVersion = nAgt.substring(verOffset + 5);
	}
	// In Chrome, the true version is after "Chrome"
	else if ((verOffset = nAgt.indexOf("Chrome")) != -1) {
		browserName = "Chrome";
		fullVersion = nAgt.substring(verOffset + 7);
	}
	// In Safari, the true version is after "Safari" or after "Version"
	else if ((verOffset = nAgt.indexOf("Safari")) != -1) {
		browserName = "Safari";
		fullVersion = nAgt.substring(verOffset + 7);
		if ((verOffset = nAgt.indexOf("Version")) != -1)
			fullVersion = nAgt.substring(verOffset + 8);
	}
	// In Firefox, the true version is after "Firefox"
	else if ((verOffset = nAgt.indexOf("Firefox")) != -1) {
		browserName = "Firefox";
		fullVersion = nAgt.substring(verOffset + 8);
	}
	// In most other browsers, "name/version" is at the end of userAgent
	else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt
			.lastIndexOf('/'))) {
		browserName = nAgt.substring(nameOffset, verOffset);
		fullVersion = nAgt.substring(verOffset + 1);
		if (browserName.toLowerCase() == browserName.toUpperCase()) {
			browserName = navigator.appName;
		}
	}
	// trim the fullVersion string at semicolon/space if present
	if ((ix = fullVersion.indexOf(";")) != -1)
		fullVersion = fullVersion.substring(0, ix);
	if ((ix = fullVersion.indexOf(" ")) != -1)
		fullVersion = fullVersion.substring(0, ix);

	majorVersion = parseInt('' + fullVersion, 10);
	if (isNaN(majorVersion)) {
		fullVersion = '' + parseFloat(navigator.appVersion);
		majorVersion = parseInt(navigator.appVersion, 10);
	}
	return browserName;
}

