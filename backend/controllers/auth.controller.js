const {
  authenticateAdmin,
  bootstrapFirstAdmin,
  createAdminUser,
  getBootstrapStatus,
  getJwtConfig,
  signAdminToken
} = require("../services/auth.service");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");

const buildAuthResponse = ({ message, user }) => {
  const { jwtExpiresIn } = getJwtConfig();

  return {
    success: true,
    message,
    data: {
      expiresIn: jwtExpiresIn,
      token: signAdminToken(user),
      user
    }
  };
};

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (typeof email !== "string" || !email.trim()) {
    throw new AppError("`email` is required and must be a non-empty string.", 400);
  }

  if (typeof password !== "string" || !password.trim()) {
    throw new AppError("`password` is required and must be a non-empty string.", 400);
  }

  const user = await authenticateAdmin({
    email: email.trim(),
    password: password.trim()
  });

  res.status(200).json(
    buildAuthResponse({
      message: "Admin authenticated successfully.",
      user
    })
  );
});

const bootstrap = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (typeof email !== "string" || !email.trim()) {
    throw new AppError("`email` is required and must be a non-empty string.", 400);
  }

  if (typeof password !== "string" || !password.trim()) {
    throw new AppError("`password` is required and must be a non-empty string.", 400);
  }

  const user = await bootstrapFirstAdmin({
    email: email.trim(),
    password: password.trim()
  });

  res.status(201).json(
    buildAuthResponse({
      message: "First admin account created successfully.",
      user
    })
  );
});

const getAuthBootstrapStatus = asyncHandler(async (_req, res) => {
  const bootstrapStatus = await getBootstrapStatus();

  res.status(200).json({
    success: true,
    data: bootstrapStatus
  });
});

const getCurrentAdmin = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user
    }
  });
});

const createAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (typeof email !== "string" || !email.trim()) {
    throw new AppError("`email` is required and must be a non-empty string.", 400);
  }

  if (typeof password !== "string" || !password.trim()) {
    throw new AppError("`password` is required and must be a non-empty string.", 400);
  }

  const user = await createAdminUser({
    email: email.trim(),
    password: password.trim()
  });

  res.status(201).json({
    success: true,
    message: "Admin user created successfully.",
    data: {
      user
    }
  });
});

module.exports = {
  bootstrap,
  createAdmin,
  getAuthBootstrapStatus,
  getCurrentAdmin,
  login
};
