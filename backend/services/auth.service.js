const jwt = require("jsonwebtoken");

const AppError = require("../utils/appError");

const DEFAULT_JWT_EXPIRES_IN = "12h";

const getAdminCredentials = () => {
  const { ADMIN_PASSWORD, ADMIN_USERNAME, JWT_EXPIRES_IN, JWT_SECRET } = process.env;

  return {
    adminPassword: ADMIN_PASSWORD,
    adminUsername: ADMIN_USERNAME,
    jwtExpiresIn: JWT_EXPIRES_IN || DEFAULT_JWT_EXPIRES_IN,
    jwtSecret: JWT_SECRET
  };
};

const ensureAuthConfig = () => {
  const { adminPassword, adminUsername, jwtExpiresIn, jwtSecret } = getAdminCredentials();

  if (!adminUsername || !adminPassword) {
    throw new AppError(
      "Admin authentication is not configured. Set ADMIN_USERNAME and ADMIN_PASSWORD.",
      500
    );
  }

  if (!jwtSecret) {
    throw new AppError("JWT authentication is not configured. Set JWT_SECRET.", 500);
  }

  return {
    adminPassword,
    adminUsername,
    jwtExpiresIn,
    jwtSecret
  };
};

const authenticateAdmin = ({ password, username }) => {
  const { adminPassword, adminUsername } = ensureAuthConfig();

  if (username !== adminUsername || password !== adminPassword) {
    throw new AppError("Invalid admin username or password.", 401);
  }

  return {
    role: "admin",
    username: adminUsername
  };
};

const signAdminToken = (user) => {
  const { jwtExpiresIn, jwtSecret } = ensureAuthConfig();

  return jwt.sign(
    {
      role: user.role,
      username: user.username
    },
    jwtSecret,
    {
      expiresIn: jwtExpiresIn,
      subject: user.username
    }
  );
};

const verifyAdminToken = (token) => {
  const { jwtSecret } = ensureAuthConfig();

  return jwt.verify(token, jwtSecret);
};

module.exports = {
  authenticateAdmin,
  getAdminCredentials,
  signAdminToken,
  verifyAdminToken
};
