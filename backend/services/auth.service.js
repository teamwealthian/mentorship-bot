const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const AdminUser = require("../models/admin-user.model");
const AppError = require("../utils/appError");

const DEFAULT_JWT_EXPIRES_IN = "12h";
const MIN_PASSWORD_LENGTH = 8;

const getJwtConfig = () => ({
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || DEFAULT_JWT_EXPIRES_IN,
  jwtSecret: process.env.JWT_SECRET
});

const ensureAuthConfig = () => {
  const { jwtExpiresIn, jwtSecret } = getJwtConfig();

  if (!jwtSecret) {
    throw new AppError("JWT authentication is not configured. Set JWT_SECRET.", 500);
  }

  return {
    jwtExpiresIn,
    jwtSecret
  };
};

const ensureDatabaseAvailable = () => {
  if (!process.env.MONGODB_URI) {
    throw new AppError(
      "MongoDB is not configured. Admin authentication requires MONGODB_URI.",
      503
    );
  }

  if (mongoose.connection.readyState !== 1) {
    throw new AppError(
      "MongoDB is currently unavailable. Admin authentication is temporarily unavailable.",
      503
    );
  }
};

const normalizeEmail = (email) => email.trim().toLowerCase();

const sanitizeAdminUser = (user) => ({
  email: user.email,
  id: String(user._id),
  isActive: user.isActive,
  role: user.role
});

const validatePasswordStrength = (password) => {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new AppError(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
      400
    );
  }
};

const getAdminUserCount = async () => {
  ensureDatabaseAvailable();

  return AdminUser.countDocuments();
};

const getBootstrapStatus = async () => {
  const count = await getAdminUserCount();

  return {
    requiresBootstrap: count === 0
  };
};

const authenticateAdmin = async ({ email, password }) => {
  ensureDatabaseAvailable();

  const normalizedEmail = normalizeEmail(email);
  const adminUser = await AdminUser.findOne({ email: normalizedEmail }).select("+passwordHash");

  if (!adminUser) {
    throw new AppError("Invalid admin email or password.", 401);
  }

  if (!adminUser.isActive) {
    throw new AppError("This admin account is inactive.", 403);
  }

  const isPasswordValid = await bcrypt.compare(password, adminUser.passwordHash);

  if (!isPasswordValid) {
    throw new AppError("Invalid admin email or password.", 401);
  }

  return sanitizeAdminUser(adminUser);
};

const bootstrapFirstAdmin = async ({ email, password }) => {
  ensureDatabaseAvailable();
  validatePasswordStrength(password);

  const normalizedEmail = normalizeEmail(email);
  const existingAdminCount = await AdminUser.countDocuments();

  if (existingAdminCount > 0) {
    throw new AppError("Bootstrap is disabled because an admin user already exists.", 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const adminUser = await AdminUser.create({
    email: normalizedEmail,
    passwordHash
  });

  return sanitizeAdminUser(adminUser);
};

const createAdminUser = async ({ email, password }) => {
  ensureDatabaseAvailable();
  validatePasswordStrength(password);

  const normalizedEmail = normalizeEmail(email);
  const existingAdminUser = await AdminUser.findOne({ email: normalizedEmail });

  if (existingAdminUser) {
    throw new AppError("An admin user with this email already exists.", 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const adminUser = await AdminUser.create({
    email: normalizedEmail,
    passwordHash
  });

  return sanitizeAdminUser(adminUser);
};

const signAdminToken = (user) => {
  const { jwtExpiresIn, jwtSecret } = ensureAuthConfig();

  return jwt.sign(
    {
      adminId: user.id,
      email: user.email,
      role: user.role
    },
    jwtSecret,
    {
      expiresIn: jwtExpiresIn,
      subject: user.id
    }
  );
};

const verifyAdminToken = (token) => {
  const { jwtSecret } = ensureAuthConfig();

  return jwt.verify(token, jwtSecret);
};

const getAuthenticatedAdminFromToken = async (token) => {
  ensureDatabaseAvailable();

  const payload = verifyAdminToken(token);

  if (payload.role !== "admin" || !payload.sub) {
    throw new AppError("You do not have access to this resource.", 403);
  }

  const adminUser = await AdminUser.findById(payload.sub);

  if (!adminUser || !adminUser.isActive) {
    throw new AppError("This admin account is no longer available.", 401);
  }

  return sanitizeAdminUser(adminUser);
};

module.exports = {
  authenticateAdmin,
  bootstrapFirstAdmin,
  createAdminUser,
  getAuthenticatedAdminFromToken,
  getBootstrapStatus,
  getJwtConfig,
  signAdminToken
};
