
/**
	settings.js
*/

var isLocal = false;
module.exports = isLocal ? require('./config') : require('./config.local');