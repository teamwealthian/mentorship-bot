const { JsonWebTokenError, TokenExpiredError } = require("jsonwebtoken");

const { getAuthenticatedAdminFromToken } = require("../services/auth.service");
const asyncHandler = require("../utils/asyncHandler");
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

const requireAdminAuth = asyncHandler(async (req, _res, next) => {
  const token = extractBearerToken(req.headers.authorization);

  try {
    req.user = await getAuthenticatedAdminFromToken(token);
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      throw new AppError("Your admin session has expired. Please sign in again.", 401);
    }

    if (error instanceof JsonWebTokenError) {
      throw new AppError("Invalid admin token.", 401);
    }

    throw error;
  }

  next();
});

module.exports = {
  requireAdminAuth
};
