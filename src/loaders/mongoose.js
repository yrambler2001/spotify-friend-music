import mongoose from 'mongoose';
import config from 'config';
import 'models';

export default async () => {
  mongoose.set('useFindAndModify', false);
  const connection = await mongoose.connect(config.databaseURL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  });
  return connection;
};
