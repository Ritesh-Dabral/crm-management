const Action = require('../../../services/action.class');


module.exports = {


  friendlyName: 'Action details',


  description: 'Lists details of a particular bulk action',


  inputs: {
    actionId:{
      type: 'string',
      required: true
    }
  },


  exits: {
    success: {
      description: 'Bulk action details fetched successfully',
      statusCode: 200
    },
    notFound: {
      description: 'Bulk action not found',
      statusCode: 404
    }
  },


  fn: async function (inputs, exits) {

    const _action = new Action();

    const action = await _action.getActionById({actionId: inputs.actionId});
    // All done.
    return exits.success(this.res.generalResponse({
      message: 'Actions fetched successfully',
      data: {
        action
      }
    }));

  }


};
