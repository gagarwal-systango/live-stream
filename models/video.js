var mongoose = require('mongoose');

var videoSchema = {
  user_id: {type: mongoose.Schema.Types.ObjectId, ref:'user'},
  channelName:{type: String, required: true}
};

var schema = new mongoose.Schema(videoSchema);

var UserHistory = mongoose.model('UserHistory', schema);

module.exports = UserHistory;