class FileChunkDao {
  constructor() {
  }

  async createChunks({chunks}, {session=null}){
    return await fileChunk.create(chunks, { session });
  }

  async updateOneChunk({query, update}, {session=null}){
    return await fileChunk.updateOne(query, update, {session});
  }

  async getFileChunkById({id}){
    return await fileChunk.findOne({_id: id}).lean();
  }

  async getFileChunks({query, sort, skip, limit}){
    const _fileChunks = await fileChunk.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();
    return _fileChunks;
  }
}

module.exports = FileChunkDao;
