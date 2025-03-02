module.exports = async function serverError(error) {
  const { res } = this;
  await sails.helpers.utils.reportError(error, this.req);
  // Define the status code to send in the response.
  const statusCode = 400;

  // If no data was provided, use res.sendStatus().
  if (error === undefined) {
    return res.sendStatus(statusCode);
  }
  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
    return res.sendStatus(statusCode);
  }
  return res.status(statusCode).send({ error });
};
