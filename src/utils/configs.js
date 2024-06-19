import dotEnv from 'dotenv';

dotEnv.config();

const configs = {
  serverPort: process.env.SERVER_PORT,
  redisHost: process.env.REDIS_HOST,
  redisPort: process.env.REDIS_PORT,
  redisUsername: process.env.REDIS_USERNAME,
  redisPassword: process.env.REDIS_PASSWORD,
  jwtSecret: process.env.JWT_SECRET,
};

export default configs;
