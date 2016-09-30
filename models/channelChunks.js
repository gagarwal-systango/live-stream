var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	  channelFile:{type: mongoose.Schema.Types.ObjectId,ref:'ChannelFile'},
	  uploadDate: { type: Date, default: Date.now },
	  data : {type: String},
	  n: {type: Number, required: true}
	});

var ChannelChunck = mongoose.model('ChannelChunck', schema);

module.exports = ChannelChunck;