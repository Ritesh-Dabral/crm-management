const Bull = require('bull');
const WorkerInterface = require('../interfaces/worker.interface');

class BullQueueWorker extends WorkerInterface {

  constructor() {
    super();
    this.name = 'bullQueueWorker';
  }

  setName(name) {
    this.name = name;
  }

  getName() {
    return this.name;
  }

  setClient(client) {
    this.client = client;
  }

  getClient() {
    return this.client;
  }

  async init(queue=null) {
    if(!queue){
      throw new Error(`Queue name is required to create client`);
    }
    if(!['file-chunk-generation'].includes(queue)){
      throw new Error(`Queue name '${queue}' is out of context. Check again`);
    }
    const client = new Bull(queue,  { redis: this.getConfiguration(), defaultJobOptions:{
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      }
    } });
    this.setClient(client);
  }

  getConfiguration(){
    return {
      host: sails.config.datastores.default.redisHost,
      port: sails.config.datastores.default.redisPort,
      password: sails.config.datastores.default.redisPassword,
      username: sails.config.datastores.default.redisUsername,
      db: sails.config.datastores.default.redisdb
    };
  }

  async fileChunkGeneration({actionId, delayInMs}) {
    const client = this.getClient();
    const resp = await client.add({actionId}, { removeOnComplete: true, removeOnFail: true, delay: delayInMs, deduplication:{id: actionId}});
    return resp;
  }

  async disconnect(){
    const client = this.getClient();
    await client.close();
  }
}

module.exports = BullQueueWorker;
