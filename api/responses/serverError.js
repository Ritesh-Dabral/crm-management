const {genericError} = require('../../enums/error')

module.exports = async function serverError(error) {
  const { res, req } = this;
  await sails.helpers.utils.reportError(error, req);
  // Define the status code to send in the response.
  const statusCode = 500;

  const response = {
    'message':'General API error. Please try again later.',
    'error': true,
    'code': genericError.serverError,
    'details': ""
  }

  const timeElapsedSinceRouteHit = req?.headers?.['X-Response-Time'] || 0;
  res.setHeader("X-Response-Time", `${(new Date().getTime()-Number(timeElapsedSinceRouteHit))}ms`);

  let logObj = JSON.stringify({
    ...req.headers, method: req.method, body: req.body, query: req.query, statusCode: statusCode, response: response
  });

  // If no data was provided, use res.sendStatus().
  if (!error) {
    sails.log(logObj);
    return res.status(statusCode).send(response);
  }
  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
    sails.log(logObj);
    return res.status(statusCode).send(response);
  }

  response.details = error.message || '';

  try {
    if (error instanceof Error) {
      response.details = JSON.stringify(error, replaceErrors)
    }
  } catch (error) {
    response.details = error.message || '';
  }

  logObj['response'] = response
  sails.log(logObj);
  return res.status(statusCode).send(response);
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
