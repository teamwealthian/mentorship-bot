const { JsonWebTokenError, TokenExpiredError } = require("jsonwebtoken");

const { verifyAdminToken } = require("../services/auth.service");
const AppError = require("../utils/appError");

const extractBearerToken = (authorizationHeader) => {
  if (!authorizationHeader) {
    throw new AppError("Authentication required.", 401);
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new AppError("Authorization header must use Bearer token format.", 401);
  }

  return token;
};

const requireAdminAuth = (req, _res, next) => {
  try {
    const token = extractBearerToken(req.headers.authorization);
    const payload = verifyAdminToken(token);

    if (payload.role !== "admin" || !payload.username) {
      throw new AppError("You do not have access to this resource.", 403);
    }

    req.user = {
      role: payload.role,
      username: payload.username
    };

    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return next(new AppError("Your admin session has expired. Please sign in again.", 401));
    }

    if (error instanceof JsonWebTokenError) {
      return next(new AppError("Invalid admin token.", 401));
    }

    return next(error);
  }
};

module.exports = {
  requireAdminAuth
};
