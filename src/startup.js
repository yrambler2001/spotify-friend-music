/* eslint-disable global-require */
import cron from 'cron';

import express from 'express';
import SpotifySongsService from './services/SpotifySongsService';
import config from './config';

const { CronJob } = cron;

const job = new CronJob({
  cronTime: '*/10 * * * * *',
  onTick: () => SpotifySongsService.update(),
  start: false,
});

async function startServer() {
  job.start();

  const app = express();
  await require('./loaders').default({ expressApp: app });
  const apolloServer = require('./apollo').default;
  const server = app.listen(config.port, () => {
    console.info(`
      #############################################
        Server listening on port: ${config.port} 
        Address: http://localhost:${config.port} ️
      ️  GraphQL: http://localhost:${config.port}${apolloServer.graphqlPath}
      #############################################
    `);
  });
  server.on('error', async function onError(err) {
    console.error(err);
    process.exit(1);
  });
}

startServer();
