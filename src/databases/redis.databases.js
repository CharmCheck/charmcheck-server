const Redis = require('redis');

const { logError } = require('../utils/errorLogger.utils');
const { generateResponse } = require('../utils/responseGenerator.utils');

let redis = null;

const initializeRedis = () => {
	redis = Redis.createClient({
		url: process.env.REDIS_URL,
	});

	redis
		.connect()
		.then((data) => {
			console.log('Redis connected');
		})
		.catch((err) => {
			logError('REDIS_CONNECTION_ERROR', err, 'REDIS_CONNECTION_ERROR', null);
			throw err;
		});

	redis.on('error', (err) => {
		logError('REDIS_ERROR', err, 'REDIS_ERROR', null);
		throw err;
	});

	redis.on('connect', () => {
		console.log('Redis connected 1');
	});

	redis.on('ready', () => {
		console.log('Redis ready');
	});

	redis.on('end', () => {
		logError(
			'REDIS_CONNECTION_ENDED',
			new Error('Redis connection ended'),
			'REDIS_CONNECTION_ENDED',
			null
		);
		throw err;
	});
};

const getHeadOfList = async (key) => {
	try {
		const headOfList = await redis.LINDEX(key, 0);

		const response = generateResponse(
			false,
			'Head fetched successfully',
			headOfList,
			'HEAD_FETCHED_SUCCESSFULLY',
			200
		);

		return response;
	} catch (err) {
		throw err;
	}
};

const popHeadOfList = async (key) => {
	try {
		const headOfList = await redis.LPOP(key);

		const response = generateResponse(
			false,
			'Head popped successfully',
			headOfList,
			'HEAD_POPPED_SUCCESSFULLY',
			200
		);

		return response;
	} catch (err) {
		throw err;
	}
};

const pushToTailOfList = async (key, value) => {
	try {
		await redis.RPUSH(key, value);

		const response = generateResponse(
			false,
			'Pushed to tail successfully',
			null,
			'PUSHED_TO_TAIL_SUCCESSFULLY',
			200
		);

		return response;
	} catch (err) {
		throw err;
	}
};

module.exports = {
	initializeRedis,
	getHeadOfList,
	popHeadOfList,
	pushToTailOfList,
};
