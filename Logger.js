const Winston = require('winston');
const Commander = require('commander');

Commander
    .option('--log-mode [mode]', 'Log Mode, options:[console, file]', 'console')
    .option('--log-level [level]', 'Log Mode, options: [error, info]', 'info')
    .parse(process.argv);

const logger = Winston.createLogger({
    'level': Commander.logLevel
});

if (Commander.logMode == 'console')
    logger.add(new Winston.transports.Console());
else if (Commander.logMode == 'file')
    logger.add(new Winston.transports.File({ 'filename': 'collector.log' }));

module.exports = logger;