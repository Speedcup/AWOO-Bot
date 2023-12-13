const pino = require('pino');
const pretty = require('pino-pretty')
const stream = pretty({
    colorize: true,
    ignore: 'pid,hostname', // --ignore,
    translateTime: "yyyy-mm-dd HH:MM:ss"
})
const logger = pino({ level: 'debug' }, stream)
module.exports = logger;