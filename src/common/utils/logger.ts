import { createLogger, format, transports } from 'winston';

export const customLogger = createLogger({
	level: 'info', // Adjust as necessary: 'info', 'debug', 'error', etc.
	format: format.combine(
		format.timestamp(),
		format.errors({ stack: true }),
		format.json(), // JSON output; you can customize this further
	),
	transports: [
		// Write error logs to file
		new transports.File({ filename: 'logs/error.log', level: 'error' }),
		// Write all logs to file
		new transports.File({ filename: 'logs/combined.log' }),
	],
});

// When not in production, output logs to the console with colorization and simple formatting.
if (process.env.NODE_ENV !== 'production') {
	customLogger.add(
		new transports.Console({
			format: format.combine(format.colorize(), format.simple()),
		}),
	);
}
