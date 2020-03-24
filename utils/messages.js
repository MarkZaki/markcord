const moment = require('moment');

function formatMessage(username, text) {
	const content = text.trim();
	return {
		username,
		content,
		time: moment().format('h:mm a')
	};
}

module.exports = formatMessage;
