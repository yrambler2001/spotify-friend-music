import mongooseLoader from './mongoose';
import expressLoader from './express';

export default async ({ expressApp }) => {
  console.log('connecting to the DB...');
  await mongooseLoader();
  console.log('DB loaded and connected');
  await expressLoader({ app: expressApp });
};
