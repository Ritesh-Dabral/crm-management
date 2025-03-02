(async () => {
  await sails.helpers.bull.chunkEntityProcessingConsumer.with()
})().catch((err) => console.log(err));
