const bcrypt = require("bcryptjs");
const otpGenerator = require("otp-generator");
const User = require("../model/userModel");
const generateToken = require("../utils/generateToken");
const { sendOTPEmail } = require("./emailService");

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
  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });

  // Set OTP expiry time (10 minutes)
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  // Create user
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

  // Send OTP email
  try {
    await sendOTPEmail(email, otp, firstName);
  } catch (error) {
    // If email fails, delete created user to avoid orphan unverified accounts
    console.error("OTP email send failed, rolling back user create:", error && error.message ? error.message : error);
    try {
      await user.destroy();
    } catch (delErr) {
      console.error("Failed to delete user after email send failure:", delErr && delErr.message ? delErr.message : delErr);
    }
    throw new Error("Failed to send OTP email. Registration aborted.");
  }

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    nationalId: user.nationalId,
    isVerified: user.isVerified,
    message: "User registered successfully. Check your email for OTP verification.",
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

  // If user not verified, allow verifying with OTP provided at login
  if (!user.isVerified) {
    if (otp) {
      // Check OTP expiry
      if (new Date() > user.otpExpiry) {
        throw new Error("OTP has expired");
      }

      if (user.otp !== otp) {
        throw new Error("Invalid OTP");
      }

      // Mark verified
      await user.update({ isVerified: true, otp: null, otpExpiry: null });
    } else {
      throw new Error("Email not verified. Please verify using the OTP sent to your email or resend OTP.");
    }
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
  getUserById,
  updateUser,
  getAllUsers,
  deleteUser,
  verifyOTP,
  resendOTP,
};