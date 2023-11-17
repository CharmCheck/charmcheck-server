const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');

const initializeSentry = (app) => {
	Sentry.init({
		dsn: process.env.SENTRY_DSN,
		integrations: [
			new Sentry.Integrations.Http({ tracing: true }),
			new Sentry.Integrations.Express({ app }),
			new ProfilingIntegration(),
		],
		// Performance Monitoring
		tracesSampleRate: 1.0,
		// Set sampling rate for profiling - this is relative to tracesSampleRate
		profilesSampleRate: 1.0,
	});
};

module.exports = { initializeSentry, Sentry };
