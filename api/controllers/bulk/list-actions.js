const Action = require('../../../services/action.class');

module.exports = {


  friendlyName: 'List actions',


  description: '',


  inputs: {
    filterParams: {
      type: 'json',
      defaultsTo:'{"columnFilters":[],"sort":[],"page":1,"dataPerPage":10}',
      example: {
        columnFilters: [{ key:'column', value: 'value', type:'enum(text, date)'}],
        sort:  [{ type: -1, field: 'id' }],
        page: 1,
        dataPerPage: 10
      },
      custom: function(data){
        data = JSON.parse(data);
        if(!Array.isArray(data.columnFilters)){
          throw new Error('columnFilters must be an array of objects {key: string, value: string, type: string}');
        }
        if(!Array.isArray(data.sort)){
          throw new Error('sort must be an array of objects {type: number, field: string}');
        }
        return true;
      }
    }
  },


  exits: {
    success:{
      statusCode: 200
    }
  },


  fn: async function (inputs, exits) {

    const filterParams = {
      page: 1,
      dataPerPage: 10,
      columnFilters: [],
      sort:  [],
      ...JSON.parse(inputs.filterParams)
    };

    const _action = new Action();

    // Build query filters
    const query = {};

    for (const filter of filterParams.columnFilters) {
      if(filter.type === 'text'){
        query[filter.key] = filter.value;
      }else if (filter.type === 'prefix') {
        query[filter.key] = new RegExp(filter.value, 'i');
      } else if (filter.type === 'date') {
        query[filter.key] = new Date(filter.value);
      }
    }

    // Build sort object
    const sort = {};
    for (const sortItem of filterParams.sort) {
      sort[sortItem.field] = sortItem.type;
    }

    // Calculate skip value for pagination
    const skip = (filterParams.page - 1) * filterParams.dataPerPage;

    // Get actions with pagination
    const actions = await _action.getActions({query, sort, skip, limit:filterParams.dataPerPage});

    // Get total count for pagination
    const total = await _action.countActions(query);
    const numPages = Math.ceil(total / filterParams.dataPerPage);
    const pagination = {
      numPages,
      totalCount: total,
      currentPage: filterParams.page,
      previousPage: filterParams.page > 1 ? filterParams.page - 1 : undefined,
      nextPage: filterParams.page < numPages ? filterParams.page + 1 : undefined,
    };

    return exits.success(this.res.generalResponse({
      message: 'Actions fetched successfully',
      data: {
        actions,
        pagination
      }
    }));
  }


};
