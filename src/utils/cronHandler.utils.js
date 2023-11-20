const cron = require('node-cron');

const {
	userProfileReviewHandler,
} = require('./userProfileReviewHandler.utils');

const initializeCronForEveryXMinutes = (minutes) => {
	console.log('initializeCronForEveryXMinutes', minutes);
	cron.schedule(`*/${minutes} * * * *`, () => {
		userProfileReviewHandler();
	});
};

module.exports = { initializeCronForEveryXMinutes };
