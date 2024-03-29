// logger to log the request and response details coming from over the network into file in logs.
// log file name format: network_NODE_ENV_Date_Month_Year.logs.json (eg: network_development_23_12_2022.logs.json)

// dont confuse this with logError which is a custom utility function to log errors generated by the catch block and misc errors. location: utils -> logErrors.utils.js

const logger = require('morgan');
const fs = require('fs');
const path = require('path');

// app is the express app
function logNetworkRequest(app) {
	try {
		// below part is for logging the response body
		const originalJson = app.response.json;
		app.response.json = function sendOverWrite(body) {
			originalJson.call(this, body);
			this.__custombody__ = body;
		};

		// response body can also be null for some cases like if the request url is not found. so we have to handle that case as well.
		logger.token('res-body', (_req, res) =>
			res.__custombody__
				? Object.keys(res.__custombody__).length
					? JSON.stringify(res.__custombody__)
					: JSON.stringify({ content: null })
				: JSON.stringify({ content: null })
		);

		// below part is for logging the request body and headers.

		// this has to be done because the request body can be empty and empty object is not a valid json.

		logger.token('req-body', (req, _res) => {
			if (req.body.base64EncodedImage) {
				req.body.base64EncodedImage = null;
			}

			return req.body
				? Object.keys(req.body).length
					? JSON.stringify(req.body)
					: JSON.stringify({ content: null })
				: JSON.stringify({ content: null });
		});
		logger.token('req-headers', (req, _res) =>
			req.headers
				? Object.keys(req.headers).length
					? JSON.stringify(req.headers)
					: JSON.stringify({ content: null })
				: JSON.stringify({ content: null })
		);

		logger.token('req-user', (req, _res) =>
			req.user
				? Object.keys(req.user).length
					? JSON.stringify(req.user)
					: JSON.stringify({ content: null })
				: JSON.stringify({ content: null })
		);

		// below part is to log time since epoch so that we can query the logs based on date range
		logger.token('time-epoch', (_req, _res) => new Date().getTime());

		// below part is for creating the log file based on the environment and on the current date with format as network_NODE_ENV_Date_Month_Year.logs.json (eg: network_production_23_12_2022.logs.json)

		// had to convert it into function because everytime we call the accessLogStream() it should create a new file with the current date if it is not already created.
		// if we dont do this then it will create a new file only when the server is restarted.
		// not to be done in case of logError(logErrors.utils.js) because it is a custom utility function and not a middleware and every line of code in it gets called everytime the function is called.
		const accessLogStream = () => {
			return fs.createWriteStream(
				path.join(
					__dirname,
					`../logs/${
						'network_' +
						process.env.NODE_ENV.toString() +
						'_' +
						new Date().getDate() +
						'_' +
						new Date().getMonth() +
						'_' +
						new Date().getFullYear()
					}.logs.json`
				),
				{ flags: 'a+' }
			);
		};

		// below part is for logging the request and response details
		app.use(
			logger(
				'{"timeEpoch": :time-epoch, "date": ":date[iso]", "userIp": ":remote-addr", "method": ":method", "url": ":url", "status": ":status", "contentLength": ":res[content-length]", "responseTime": ":response-time ms",  "httpVersion": ":http-version", "referrer": ":referrer", "userAgent": ":user-agent", "responseBody": :res-body, "requestBody": :req-body, "requestHeaders": :req-headers, "requestUser": :req-user} ,',
				{
					stream: {
						write: function (str) {
							accessLogStream().write(str); // calling accessLogStream() everytime to create a new file with the current date if it is not already created and then writing the logs into it.
						},
					},
				}
			)
		);
	} catch (error) {
		throw err;
	}
}

module.exports = { logNetworkRequest };
