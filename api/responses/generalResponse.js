module.exports = function generalResponse({code='', message='', data=null, details=null, error=false}) {

  const { res, req } = this;

  const response = {
    'message': message,
    'error': error,
    'code': code,
    'details': null,
    'data': data
  }


  try {
    const isBuild = (process.env.NODE_ENV==='production'||process.env.NODE_ENV==='staging') ? true : false;
    if (details instanceof Error) {
      response.details = !isBuild ? JSON.stringify(details, replaceErrors) : ''
    }
    const timeElapsedSinceRouteHit = req?.headers?.['X-Response-Time'] || 0;
    res.setHeader("X-Response-Time", `${(new Date().getTime()-Number(timeElapsedSinceRouteHit))}ms`);
  } catch (error) {
    response.details = details
  }

  sails.log(JSON.stringify({
    ...req.headers, method: req.method, body: req.body, query: req.query, response: response
  }));

  return response;
};

function replaceErrors(key, value) {
  if (value instanceof Error) {
      var error = {};

      Object.getOwnPropertyNames(value).forEach(function (propName) {
          error[propName] = value[propName];
      });

      return error;
  }

  return value;
}
