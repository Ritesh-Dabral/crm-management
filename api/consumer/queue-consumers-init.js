const BullQueueWorker = require('../../services/bullQueue.class');
const worker = new BullQueueWorker();
const worker2 = new BullQueueWorker();

(async () => {
  worker.init('file-chunk-generation');
  worker.fileChunkGenerationQueueConsumer();

  worker2.init('chunk-entity');
  worker2.chunkEntityGenerationQueueConsumer();
})().catch((err) => {
  console.log(err);
});
