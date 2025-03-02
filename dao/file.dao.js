class FileDao {
  constructor() {
  }

  async getFileById({id}) {
    const _f = await file.findOne({ _id: id }).lean();
    return _f;
  }

  async createFile({url, rows, columns, type, name}, {session=null}){
    const fileResponse = await file.create([{
      'url': url,
      'rows': rows,
      'columns': columns,
      'type': type,
      'name': name
    }], { session });
    return fileResponse[0];
  }
}

module.exports = FileDao;
