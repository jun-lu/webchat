
/**
	settings.js
*/

module.exports = process.env.EXPRESS_COV ? {
  cookieSecret: 'webchatvoid',
  db: 'webchat_session',
  host: '127.0.0.1',
} : {

	cookieSecret:'webchatvoid',
	db:'webchat_session',
	host:'42.121.28.162'
};