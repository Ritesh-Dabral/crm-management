const mongoose = require('mongoose');
const BullQueueWorker = require('../../../services/bullQueue.class');
const WorkerInterface = require('../../../interfaces/worker.interface');
const File = require('../../../services/file.class');
const Action = require('../../../services/action.class');

module.exports = {


  friendlyName: 'Create actions',


  description: 'Creates one/more bulk actions',


  inputs: {
    "accountId":{
      type:"string",
      required:true
    },
    "actionName":{
      type:"string",
      required:true
    },
    "processingDelayInMinutes":{
      type:"number",
      required:true,
      custom: function(data){
        if(typeof data !== 'number' || data<0 || data>10080){
          throw new Error('Processing delay must be between 0 and 10080');
        }
        return true;
      }
    },
    "actions":{
      type:"json",
      columnType:"array",
      required:true,
      custom: function(data){
        let example = JSON.stringify(        {
          "entity":"string",
          "action":"string",
          "identifier":{
              "create":["string"],
              "update":["string"]
          },
          "matches":[
              {
                  "csvField":"string",
                  "internalProperty":"string"
              }
          ]
      })
        if(!Array.isArray(data)){
          // throw new Error('Actions must be an array');
          return false;
        }
        if(data.length === 0 || data.length > 10){
          // throw new Error('Actions must be between 1 and 10');
          return false;
        }
        data.forEach(action => {
          let isValid = true;
          if(typeof action !== 'object'){
            isValid = false;
          }
          if(!action.entity || !action.entity?.trim() || typeof action.entity !== 'string'){
            isValid = false;
          }
          if(!action.action || !action.action?.trim() || typeof action.action !== 'string'){
            isValid = false;
          }
          if(typeof action.identifier !== 'object'){
            isValid = false;
          }
          if(!_.get(action,'identifier.create.0') && !_.get(action,'identifier.update.0')){
            isValid = false;
          }
          if(!_.get(action,'matches.0')){
            isValid = false;
          }else{
            action.matches.forEach(match => {
              if(typeof match.csvField !== 'string' || !match.csvField?.trim()){
                isValid = false;
              }
              if(typeof match.internalProperty !== 'string' || !match.internalProperty?.trim()){
                isValid = false;
              }
            });
          }

          if(!isValid){
            // throw new Error('Actions must be a list of objects in the format of '+example);
            return false;
          }
        });

        return true;
      }
    },
    "file":{
      type:"json",
      columnType:"array",
      required:true,
      custom: function(data){
        let example = JSON.stringify({
          "url":"string",
          "meta":{
              "rows":"number between 1 and 10000",
              "columns":"number between 1 and 100"
          }})
        if(!Array.isArray(data)){
          // return new Error('files must be a list in the format of '+example);
          return false;
        }
        if(data.length === 0 || data.length > 5){
          // return new Error('files must be between 1 and 5');
          return false;
        }
        let file = data
        let isValid = true;
        if(typeof file !== 'object'){
          isValid = false;
        }
        if (!file.url || !file.url?.trim() || typeof file.url !== 'string'){
          isValid = false;
        }
        if (!file.meta || typeof file.meta !== 'object'){
          isValid = false;
        }
        if (typeof file.meta.rows !== 'number' || file.meta.rows<1 || file.meta.rows>10000){
          isValid = false;
        }
        if (typeof file.meta.columns !== 'number' || file.meta.columns<1 || file.meta.columns>100){
          isValid = false;
        }
        if(!isValid){
          return false
        }
        return true;
      }
    }
  },


  exits: {
    success: {
      description: 'Bulk actions created successfully',
      statusCode: 200
    }
  },


  fn: async function (inputs, exits) {
    const {accountId, actionName, actions, file: inputFile, processingDelayInMinutes} = inputs;
    const nowMs = Date.now(); // Get current time in milliseconds
    const futureMs = nowMs + processingDelayInMinutes * 60 * 1000; // Convert 200 minutes to milliseconds and add
    const session = await mongoose.startSession();
    await session.startTransaction();
    let actionId;

    let worker = new BullQueueWorker();
    worker.init('file-chunk-generation');

    if(!worker instanceof WorkerInterface) {
      throw new Error("Invalid WorkerInterface type of instance");
    }
    const _file = new File();
    const _action = new Action();


    try {
      await _file.createFile({
        url: inputFile.url,
        rows: inputFile.meta.rows,
        columns: inputFile.meta.columns,
        type: 'csv',
        name: inputFile.url.split('/').pop()
      }, { session });
      const fileId = _file.getFileId();
      // Create actionMeta

      await _action.createAction({
        actionName,
        accountId,
        processTimeInMs: futureMs,
        fileId,
        actions: actions,
        status: 'queued'
      }, { session });
      actionId = _action.getActionId();
      await worker.fileChunkGeneration({"actionId":actionId, "delayInMs": futureMs-nowMs});
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
      worker.disconnect();
    }


    return exits.success(this.res.generalResponse({'message': 'Bulk actions created successfully', 'data': {actionId: actionId}}));
  }


};
