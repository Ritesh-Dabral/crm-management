const redis = require('redis');
const redisUrl = `redis://${sails.config.datastores.default.redisUsername}:${sails.config.datastores.default.redisPassword}@${sails.config.datastores.default.redisHost}:${sails.config.datastores.default.redisPort}/${sails.config.datastores.default.redisdb}`;

(async () => {
  console.log('Connecting to redis db 1...');
  const redisClient = redis.createClient({ url: redisUrl, database:1 });
  await redisClient.connect();
  global['redisClient'] = redisClient;
})().catch((err) => {
  sails.log(err);
});
