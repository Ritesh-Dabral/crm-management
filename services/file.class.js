const FileDao = require('../dao/file.dao');
const fDao = new FileDao();

class File {

  constructor() {
    this._fileId = null;
  }

  setFileId(fileId) {
    this._fileId = fileId;
  }

  getFileId() {
    if (!this._fileId) {
      throw new Error('File ID is not set');
    }
    return this._fileId;
  }

  async createFile({url, rows, columns, type, name}, {session=null}){
    const file = await fDao.createFile({url, rows, columns, type, name}, {session});
    this.setFileId(file._id.toString());
    return file;
  }

  async getFileById({fileId}) {
    const file = await fDao.getFileById({id:fileId});
    return file;
  }
}

module.exports = File;
