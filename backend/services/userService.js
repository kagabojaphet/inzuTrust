const bcrypt = require("bcryptjs");
const otpGenerator = require("otp-generator");
const User = require("../model/userModel");
const generateToken = require("../utils/generateToken");
const { sendOtpEmail } = require("../config/emailConfig");
const otpGenerator = require("otp-generator");

// Generate 6-digit OTP
const generateOTP = () => {
  return otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });
};

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

  // Generate OTP
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

  // Create user with OTP
  const user = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    phone,
    role: role || "tenant",
    nationalId,
    otp,
    otpExpiry,
    isVerified: false,
  });

  // Send OTP to email
  try {
    await sendOtpEmail(email, otp);
  } catch (error) {
    // Delete user if email fails to send
    await user.destroy();
    throw new Error("Failed to send verification code. Please try again.");
  }

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    nationalId: user.nationalId,
    message: "Registration successful. Please check your email for OTP verification code.",
  };
};

// Login user
const loginUser = async ({ email, password, otp = null }) => {
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

  // Check if user is verified
  if (!user.isVerified) {
    throw new Error("Please verify your email first");
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

// Verify OTP
const verifyOtp = async ({ email, otp }) => {
  // Find user by email
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new Error("User not found");
  }

  // Check if user already verified
  if (user.isVerified) {
    throw new Error("User already verified");
  }

  // Check if OTP is expired
  if (!user.otpExpiry || new Date() > user.otpExpiry) {
    throw new Error("OTP has expired. Please request a new one.");
  }

  // Check if OTP matches
  if (user.otp !== otp) {
    throw new Error("Invalid OTP");
  }

  // Mark user as verified
  user.isVerified = true;
  user.otp = null;
  user.otpExpiry = null;
  await user.save();

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
    message: "Email verified successfully",
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

// Verify OTP
const verifyOTP = async (email, otp) => {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw new Error("User not found");
  }

  // Check if OTP is expired
  if (new Date() > user.otpExpiry) {
    throw new Error("OTP has expired");
  }

  // Check if OTP matches
  if (user.otp !== otp) {
    throw new Error("Invalid OTP");
  }

  // Mark user as verified
  await user.update({
    isVerified: true,
    otp: null,
    otpExpiry: null,
  });

  // Generate token for verified user
  const token = generateToken(user.id);

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isVerified: user.isVerified,
    token,
    message: "Email verified successfully",
  };
};

// Resend OTP
const resendOTP = async (email) => {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.isVerified) {
    throw new Error("User is already verified");
  }

  // Generate new OTP
  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });

  // Set OTP expiry time (10 minutes)
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  // Update user with new OTP
  await user.update({
    otp,
    otpExpiry,
  });

  // Send OTP email
  try {
    await sendOTPEmail(email, otp, user.firstName);
  } catch (error) {
    console.error("OTP email send failed:", error);
    throw new Error("Failed to send OTP email");
  }

  return {
    message: "OTP resent successfully to your email",
  };
};

module.exports = {
  registerUser,
  loginUser,
  verifyOtp,
  getUserById,
  updateUser,
  getAllUsers,
  deleteUser,
  verifyOTP,
  resendOTP,
};