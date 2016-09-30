var mongoose = require('mongoose'),
    bcrypt = require('bcrypt-nodejs');

var userSchema = {
    user_id: { type: String, reqired: true },
    password: { type: String, reqired: true },
    name: { type: String },
    channel:[String]  
};

var schema = new mongoose.Schema(userSchema);

schema.methods.encryptPassword = function(password){
	return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};

schema.methods.validPassword = function(password){
	return bcrypt.compareSync(password, this.password);
};

var Users = mongoose.model('Users', schema);

module.exports = Users;