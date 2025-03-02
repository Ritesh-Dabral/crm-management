const BullQueueWorker = require('../../services/bullQueue.class');
const worker = new BullQueueWorker();

(async () => {
  worker.init('file-chunk-generation');
  await worker.fileChunkGenerationQueueConsumer();
})().catch((err) => {
  console.log(err);
});
