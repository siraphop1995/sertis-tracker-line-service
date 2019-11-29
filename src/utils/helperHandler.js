const jwt = require('jsonwebtoken');
/**
 * Async wrapper to wrap module with
 * try catch
 */
function asyncWrapper(fn) {
  return async (req, res, next) => {
    try {
      return await fn.apply(null, [req, res, next]);
    } catch (err) {
      next(err);
    }
  };
}


/**
 * Middlewear that check bearer token in headers.
 *
 * @param     req.headers.authorization {string} Bearer token.
 * @response
 *       200:
 *         description: Authorized
 *       401:
 *         description: Not authorized
 *         return {string} Rejection mesage
 */
function checkToken(req, res, next) {
  let token = req.headers['authorization'];
  if (token) {
    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length);
    }
    jwt.verify(token, 'secret', (err, decoded) => {
      if (err) {
        return res.status(401).json({
          success: false,
          location: 'middleware checkToken',
          message: 'Token is not valid'
        });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    return res.status(401).json({
      success: false,
      location: 'middleware checkToken',
      message: 'Auth token is not supplied'
    });
  }
}

module.exports = {
  asyncWrapper,
  checkToken
};
