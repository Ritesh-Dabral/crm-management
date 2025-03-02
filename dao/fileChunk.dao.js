class FileChunkDao {
  constructor() {
  }

  async createChunks({chunks}, {session=null}){
    return await fileChunk.create(chunks, { session });
  }

  async updateOneChunk({query, set}, {session=null}){
    return await fileChunk.updateOne(query, { $set: set}, {session});
  }
}

module.exports = FileChunkDao;
