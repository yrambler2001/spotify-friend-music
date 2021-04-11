/* eslint-disable global-require */
import cron from 'cron';
import SpotifySongsService from './services/SpotifySongsService';

const { CronJob } = cron;

// Each 10 secs
const job = new CronJob({
  cronTime: '*/10 * * * * *',
  onTick: () => SpotifySongsService.update(),
  start: false,
});

async function startServer() {
  await require('./loaders').default();
  job.start();
}

startServer();
