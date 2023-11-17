const cron = require('node-cron');

const initializeCronForEveryXMinutes = (minutes) => {
	console.log('initializeCronForEveryXMinutes', minutes);
	cron.schedule(`*/${minutes} * * * *`, () => {});
};

module.exports = { initializeCronForEveryXMinutes };
