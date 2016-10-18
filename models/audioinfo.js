var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    channelChunk: { type: mongoose.Schema.Types.ObjectId, ref: 'ChannelChunk' },
    audio_pos:{type: Number,required: true},
    song_id:{type:String, required:true},
});

var audioInfo = mongoose.model('audioInfo', schema);

module.exports = audioInfo;