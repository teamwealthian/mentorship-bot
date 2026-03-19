const { authenticateAdmin, getAdminCredentials, signAdminToken } = require("../services/auth.service");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");

const login = asyncHandler(async (req, res) => {
  const { password, username } = req.body;

  if (typeof username !== "string" || !username.trim()) {
    throw new AppError("`username` is required and must be a non-empty string.", 400);
  }

  if (typeof password !== "string" || !password.trim()) {
    throw new AppError("`password` is required and must be a non-empty string.", 400);
  }

  const user = authenticateAdmin({
    password: password.trim(),
    username: username.trim()
  });
  const token = signAdminToken(user);
  const { jwtExpiresIn } = getAdminCredentials();

  res.status(200).json({
    success: true,
    message: "Admin authenticated successfully.",
    data: {
      expiresIn: jwtExpiresIn,
      token,
      user
    }
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

module.exports = {
  getCurrentAdmin,
  login
};
