/**
 * API vk
 */
var socketsService = require(SERVICES_PATH + '/sockets');
var _ = require('underscore');
var fs = require('fs');
var restler = require('restler');
var messages = require(SERVICES_PATH + '/references/messages/messages');

var API = function() {
	var me = this;

	me.service = require(SERVICES_PATH + '/social/vk');

	me.channel = socketsService.createChannel('vk');
	me.channel.on('upload_wallpost_image', me.cmdUploadWallpostImage, me);

	me.errorChannel = socketsService.createChannel('error');
}

//============== API commands ==============

API.prototype.cmdUploadWallpostImage = function(userModel, data, callback) {
	var me = this,
		imagePath = BASE_PATH + '/client/img/' + data.image;

	if (!data.image || !data.upload_url) {
		me.errorChannel.push(userModel.id, 'error', {msg: messages.getByKey('msg_invalid_params')});
		return;
	}

	fs.stat(imagePath, function(err, stats) {
		if (!err) {
		    restler.post(data.upload_url, {
		        multipart: true,
		        data: {
		            "photo": restler.file(imagePath, null, stats.size, null, "image/jpg")
		        }
		    }).on("complete", function(data) {
		        callback(JSON.parse(data));
		    });
		} else {
			me.errorChannel.push(userModel.id, 'error', {msg: messages.getByKey('msg_file_not_found')});
		}
	});

}

// Создает только один экземпляр класса
API.getInstance = function(){
    if (!this.instance) {
    	this.instance = new API();
    }
    return this.instance;
}

module.exports = API.getInstance();