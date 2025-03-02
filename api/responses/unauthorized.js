/**
 * unauthorized.js
 *
 * A custom response that content-negotiates the current request to either:
 *  • log out the current user and redirect them to the login page
 *  • or send back 401 (Unauthorized) with no response body.
 *
 * Example usage:
 * ```
 *     return res.unauthorized();
 * ```
 *
 * Or with actions2:
 * ```
 *     exits: {
 *       badCombo: {
 *         description: 'That email address and password combination is not recognized.',
 *         responseType: 'unauthorized'
 *       }
 *     }
 * ```
 */
module.exports = function unauthorized() {
  const { req } = this;
  const { res } = this;

  sails.log.verbose('Ran custom response: res.unauthorized()');
  sails.log('unauthorised');

  if (req.wantsJSON) {
    return res.sendStatus(401);
  }
  // Or log them out (if necessary) and then redirect to the login page.

  // return res.sendStatus(401);
  return res.redirect('/login');
};
