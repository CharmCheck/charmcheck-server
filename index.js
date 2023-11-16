require('dotenv').config({
	path: `.env.${process.env.NODE_ENV}`,
});
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');

const { generateResponse } = require('./src/utils/responseGenerator.utils');
const { logError } = require('./src/utils/errorLogger.utils');
const {
	logNetworkRequest,
} = require('./src/middlewares/networkLogger.middlewares');
const { connectMongoDB } = require('./src/databases/mongoDb.databases');
const { rateLimiter } = require('./src/middlewares/rateLimiter.middlewares');

const app = express();

// Middlewares
app.use(cors());
app.use(helmet());
app.set('trust proxy', 1);
app.use(bodyParser.json({ limit: '2mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

logNetworkRequest(app);

connectMongoDB();

app.use('/favicon.ico', (req, res) => {
	res.status(204).end();
});

app.use(rateLimiter);

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
