const cron = require('node-cron');
const queue = require('./queue');

cron.schedule('15 3 * * *', () => queue.add('RECALCULATE_PREDICTIVE_SCORES', {}), { timezone: 'Europe/Istanbul' });
setTimeout(() => queue.add('RECALCULATE_PREDICTIVE_SCORES', {}), 10_000);
