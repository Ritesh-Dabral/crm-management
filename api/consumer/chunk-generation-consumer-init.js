(async () => {
  await sails.helpers.bull.chunkGenerationConsumer.with()
})().catch((err) => console.log(err));
