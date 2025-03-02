class ActionDao {
  constructor() {
  }

  async getActionById(id) {
  }

  async createAction({actionName, accountId, processTimeInMs, fileId, actions}, {session=null}){
    const actionResponse = await action.create([{
      actionName,
      accountId,
      processTimeInMs,
      file: fileId,
      actions,
      status: 'queued'
    }], { session });
    return actionResponse[0];
  }

  async getActions({query, sort, skip, limit}){
    const actions = await action.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();
    return actions;
  }

  async countActions({query}){
    return await action.countDocuments(query);
  }

  async getActionById({id}){
    return await action.findOne({_id: id}).lean();
  }

  async updateOneAction({query, update}, {session=null}){
    return await action.updateOne(query, update, {session});
  }
}

module.exports = ActionDao;
