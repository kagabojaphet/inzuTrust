const bcrypt = require("bcryptjs");
const User = require("../model/userModel");
const generateToken = require("../utils/generateToken");

// Register a new user
const registerUser = async ({
  firstName,
  lastName,
  email,
  password,
  phone,
  role,
  nationalId,
}) => {
  // Check if user already exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new Error("Email already registered");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    phone,
    role: role || "tenant",
    nationalId,
  });

  // Return user data + token (exclude password)
  const token = generateToken(user.id);

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    nationalId: user.nationalId,
    token,
  };
};

// Login user
const loginUser = async ({ email, password }) => {
  // Find user by email
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  // Generate token
  const token = generateToken(user.id);

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    token,
  };
};

// Get user by ID
const getUserById = async (id) => {
  const user = await User.findByPk(id, {
    attributes: { exclude: ["password"] },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// Update user
const updateUser = async (id, updates) => {
  const user = await User.findByPk(id);
  if (!user) {
    throw new Error("User not found");
  }

  // Prevent updating email to one that already exists
  if (updates.email && updates.email !== user.email) {
    const exists = await User.findOne({ where: { email: updates.email } });
    if (exists) {
      throw new Error("Email already in use");
    }
  }

  // Hash new password if provided
  if (updates.password) {
    const salt = await bcrypt.genSalt(10);
    updates.password = await bcrypt.hash(updates.password, salt);
  }

  // Don't allow role update through this endpoint (security)
  delete updates.role;

  await user.update(updates);

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };
};

// Get all users (admin)
const getAllUsers = async () => {
  const users = await User.findAll({
    attributes: { exclude: ["password"] },
  });
  return users;
};

// Delete user
const deleteUser = async (id) => {
  const user = await User.findByPk(id);
  if (!user) {
    throw new Error("User not found");
  }
  await user.destroy();
};

module.exports = {
  registerUser,
  loginUser,
  getUserById,
  updateUser,
  getAllUsers,
  deleteUser,
};