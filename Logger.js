const logger = require('winston');
const Commander = require('commander');

Commander
    .option('--log-mode [mode]', 'Log Mode, options:[console, file]', 'console')
    .option('--log-level [level]', 'Log Mode, options: [error, info]', 'info')
    .parse(process.argv);

logger.level = Commander.logLevel;

if (Commander.logMode == 'file'){
    logger.add(logger.transports.File, { 'filename': 'toy.log' });
    logger.remove(logger.transports.Console);
}
module.exports = logger;
