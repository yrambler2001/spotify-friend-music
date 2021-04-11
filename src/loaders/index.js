import mongooseLoader from './mongoose';

export default async () => {
  console.log('connecting to the DB...');
  await mongooseLoader();
  console.log('DB loaded and connected');
};
