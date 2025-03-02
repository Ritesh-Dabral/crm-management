class WorkerInterface {

  constructor() {
    if(this.constructor == WorkerInterface) {
      throw new Error('WorkerInterface is an abstract class and cannot be instantiated.');
    }
    ['fileChunkGeneration', 'init'].forEach(fn => {
      if(this[fn] === undefined) {
        throw new Error(`${fn} implementation is missing in ${this.constructor.name}`);
      }
    });
  }
}


module.exports = WorkerInterface;
