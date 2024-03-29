require('dotenv').config({
	path: `.env.${process.env.NODE_ENV}`,
});
const { Sentry, initializeSentry } = require('./src/config/sentry.config');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');

const { generateResponse } = require('./src/utils/responseGenerator.utils');
const { logError } = require('./src/utils/errorLogger.utils');
const { connectMongoDB } = require('./src/databases/mongoDb.databases');
const { rateLimiter } = require('./src/middlewares/rateLimiter.middlewares');
const { initializeRedis } = require('./src/databases/redis.databases');
const {
	initializeCronForEveryXMinutes,
} = require('./src/utils/cronHandler.utils');

const app = express();

initializeSentry(app);

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

app.use(cors());
app.use(helmet());
app.set('trust proxy', 1);
app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

connectMongoDB();
initializeRedis();

app.use('/favicon.ico', (req, res) => {
	res.status(204).end();
});

app.use(rateLimiter);

initializeCronForEveryXMinutes(Number(process.env.CRON_INTERVAL_IN_MINUTES));

app.get('/sentry-debug', () => {
	try {
		throw new Error('My first Sentry error!');
	} catch (err) {
		logError('SENTRY_DEBUG', err, 'SENTRY_DEBUG', null);
	}
});

app.get('/', (_, res) => {
	const response = generateResponse(
		false,
		'Welcome to the CharmCheck.xyz!',
		null,
		'APP_WELCOME',
		200
	);

	res.status(response.responseStatusCode).json(response);
});

app.use('/api/v1/image', require('./src/apis/routes/image.routes'));
app.use('/api/v1/review', require('./src/apis/routes/review.routes'));
app.use('/api/v1/payment', require('./src/apis/routes/payment.routes'));

app.use(
	Sentry.Handlers.errorHandler({
		shouldHandleError: (err) => err.status >= 400,
	})
);

app.use((err, req, res, next) => {
	const response = generateResponse(
		true,
		"There's an unexpected error. Please refresh the page and try again!",
		null,
		'APP_ERROR',
		500
	);

	logError(response.responseId, err, response.responseStringCode, null);

	res.status(response.responseStatusCode).json(response);
});

process.on('uncaughtException', (err) => {
	const response = generateResponse(
		true,
		"There's an unexpected error. Please refresh the page and try again!",
		null,
		'APP_ERROR_1',
		500
	);

	logError(response.responseId, err, response.responseStringCode, null);
});

process.on('unhandledRejection', (err) => {
	const response = generateResponse(
		true,
		"There's an unexpected error. Please refresh the page and try again!",
		null,
		'APP_ERROR_2',
		500
	);

	logError(response.responseId, err, response.responseStringCode, null);
});

const { PORT } = process.env;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
