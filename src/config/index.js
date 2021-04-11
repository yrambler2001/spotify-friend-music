import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config();
dotenv.config({ path: resolve(process.cwd(), '.env.cred') });

export default {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV !== 'development',
  databaseURL: process.env.MONGODB_URI,
  spDcCookie: process.env.SPDC_COOKIE,
};
