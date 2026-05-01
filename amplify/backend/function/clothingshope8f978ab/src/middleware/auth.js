'use strict';

const { error } = require('../utils/response');

function auth(req, res, next) {
  try {
    const event = req.apiGateway && req.apiGateway.event;
    if (!event) return error(res, 'Unauthorized', 401);

    const requestContext = event.requestContext || {};
    
    // Try Cognito User Pool Authorizer first (claims.sub)
    const claims = requestContext.authorizer && requestContext.authorizer.claims;
    if (claims && claims.sub) {
      req.userId = claims.sub;
      return next();
    }

    // Fall back to IAM auth with Cognito Identity Pool
    // The user sub is in cognitoAuthenticationProvider: "...CognitoSignIn:<sub>"
    const identity = requestContext.identity || {};
    const authProvider = identity.cognitoAuthenticationProvider;
    if (authProvider) {
      const parts = authProvider.split(':');
      const sub = parts[parts.length - 1];
      if (sub) {
        req.userId = sub;
        return next();
      }
    }

    return error(res, 'Unauthorized', 401);
  } catch (err) {
    console.error('Auth middleware error:', err);
    return error(res, 'Unauthorized', 401);
  }
}

module.exports = auth;
