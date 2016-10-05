var mongoose = require('mongoose');

var channelSchema = {
    channelName: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now },
    totalChunks: { type: Number, required: true },
    token: { type: String, required: true },
    live: { type: Boolean }
};

var schema = new mongoose.Schema(channelSchema);

var channelFile = mongoose.model('ChannelFile', schema);

module.exports = channelFile;