const ActionDao = require('../dao/action.dao');
const aDao = new ActionDao();

class Action {

  constructor() {
    this._actionId = null;
  }

  setActionId(fileId) {
    this._actionId = fileId;
  }

  getActionId() {
    if (!this._actionId) {
      throw new Error('Action ID is not set');
    }
    return this._actionId;
  }

  async createAction({actionName, accountId, processTimeInMs, fileId, actions}, {session=null}){
    const action = await aDao.createAction({actionName, accountId, processTimeInMs, fileId, actions}, {session});
    this.setActionId(action._id.toString());
    return action;
  }

  async getActions({query, sort={}, skip=0, limit=0}){
    return await aDao.getActions({query, sort, skip, limit});
  }

  async countActions({query}){
    return await aDao.countActions({query});
  }

  async getActionById({actionId}){
    return await aDao.getActionById({id:actionId});
  }

  async updateOneAction({query, update}, {session=null}){
    return await aDao.updateOneAction({query, update}, {session});
  }
}

module.exports = Action;
