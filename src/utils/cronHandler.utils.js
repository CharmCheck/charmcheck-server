const cron = require('node-cron');

const {
	userProfileReviewHandler,
} = require('./userProfileReviewHandler.utils');

const initializeCronForEveryXMinutes = (minutes) => {
	cron.schedule(`*/${minutes} * * * *`, () => {
		userProfileReviewHandler();
		console.log('Running cornjob', new Date());
	});
};

module.exports = { initializeCronForEveryXMinutes };
