// william wall
var mongoose = require('mongoose');

module.exports.connect = function() {
	mongoose.connect('mongodb://will:william1@ds125341.mlab.com:25341/post-app');
    // mongodb://localhost:27017/MEVN-boilerplate
	var db = mongoose.connection;
	db.on("error", console.error.bind(console, "connection error"));
	db.once("open", function(callback){
	  console.log("Connection Succeeded");
	});
	return db;
}