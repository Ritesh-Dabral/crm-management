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
    if(!['file-chunk-generation', 'chunk-entity'].includes(queue)){
      throw new Error(`Queue name '${queue}' is out of context. Check again`);
    }
    const client = new Bull(queue,  { redis: this.getConfiguration(), defaultJobOptions:{
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
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

  async fileChunkGeneration({actionId, delayInMs=0}) {
    const client = this.getClient();
    const resp = await client.add({actionId}, { removeOnComplete: true, removeOnFail: true, delay: delayInMs, deduplication:{id: actionId}});
    return resp;
  }

  async fileChunkGenerationQueueConsumer(){
    const client = this.getClient();
    client.process(1, async (job) => {
      const messageData = job.data;
      const requiredKeys = ['actionId'];
      try {
        const isMessageValid = requiredKeys.every((key) => messageData.hasOwnProperty(key));
        sails.log.info(`Processing chunk generation message:`, messageData);
        if (!isMessageValid) {
          throw new Error(`Missing required keys in job data: ${JSON.stringify(messageData)}`);
        }
        await sails.helpers.file.chunkGeneration.with({ actionId: messageData.actionId });
        sails.log.info('Chunk generation processed successfully for actionId:' + messageData.actionId);
        return Promise.resolve();
      } catch (error) {
        sails.log.error('Error running chunk generation job:', error);
        return Promise.reject(error);
      }
    });
  }

  async chunkEntityBulkQueueProducer({chunkEntity, delayInMs=0}){
    const client = this.getClient();
    const resp = await client.addBulk(chunkEntity, { removeOnComplete: true, removeOnFail: true, delay: delayInMs});
    return resp;
  }

  async disconnect(){
    const client = this.getClient();
    await client.close();
  }
}

module.exports = BullQueueWorker;
