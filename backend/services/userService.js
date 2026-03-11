const bcrypt = require("bcryptjs");
const otpGenerator = require("otp-generator");
// Important: Importing from /model/index.js ensures associations are loaded
const { User, TenantProfile, LandlordProfile, sequelize } = require("../model"); 
const generateToken = require("../utils/generateToken");
const { sendOtpEmail } = require("../config/emailConfig");

/**
 * Helper: Generate 6-digit numeric OTP
 */
const generateOTP = () => {
  return otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });
};

/**
 * @desc Register a new user and create their role-specific profile
 */
const registerUser = async (userData) => {
  const { firstName, lastName, email, password, phone, role, nationalId, companyName } = userData;

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) throw new Error("Email already registered");

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  const transaction = await sequelize.transaction();

  try {
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      role: role || "tenant",
      otp,
      otpExpiry,
    }, { transaction });

    if (user.role === "landlord") {
      await LandlordProfile.create({
        userId: user.id,
        companyName: companyName || null,
      }, { transaction });
    } else if (user.role === "tenant") {
      await TenantProfile.create({
        userId: user.id,
        nationalId: nationalId || null,
      }, { transaction });
    }

    await transaction.commit();

    try {
      await sendOtpEmail(email, otp);
    } catch (emailError) {
      console.error("OTP Email failed to send:", emailError);
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      message: "Registration successful. Please verify your email.",
    };
  } catch (error) {
    await transaction.rollback();
    throw new Error(error.message || "Registration failed");
  }
};

/**
 * @desc Login user and return token + profile data
 */
const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ 
    where: { email },
    include: [
      { model: LandlordProfile, as: 'landlordProfile' },
      { model: TenantProfile, as: 'tenantProfile' }
    ]
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error("Invalid email or password");
  }

  if (!user.isVerified) throw new Error("Please verify your email first");

  const token = generateToken(user.id);

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    profile: user.role === 'landlord' ? user.landlordProfile : user.tenantProfile,
    token,
  };
};

/**
 * @desc Get user by ID with eager-loaded profile
 */
const getUserById = async (id) => {
  const user = await User.findByPk(id, {
    attributes: { exclude: ["password", "otp", "otpExpiry"] },
    include: [
      { model: LandlordProfile, as: 'landlordProfile', required: false },
      { model: TenantProfile, as: 'tenantProfile', required: false }
    ]
  });

  if (!user) throw new Error("User not found");
  
  const userData = user.toJSON();
  if (user.role === 'landlord') delete userData.tenantProfile;
  if (user.role === 'tenant') delete userData.landlordProfile;
  if (user.role === 'admin') {
     delete userData.landlordProfile;
     delete userData.tenantProfile;
  }

  return userData;
};

/**
 * @desc Update User and Role-specific Profile using a transaction
 */
const updateUserProfile = async (userId, updates) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

  const transaction = await sequelize.transaction();

  try {
    // 1. Update Core User table
    await user.update({
      firstName: updates.firstName || user.firstName,
      lastName: updates.lastName || user.lastName,
      phone: updates.phone || user.phone,
    }, { transaction });

    // 2. Update/Insert Role-Specific Profile data
    if (user.role === 'landlord') {
      await LandlordProfile.upsert({
        userId: userId,
        companyName: updates.companyName,
        tinNumber: updates.tinNumber,
        businessAddress: updates.businessAddress,
        website: updates.website,
        bio: updates.bio
      }, { transaction });
    } else if (user.role === 'tenant') {
      await TenantProfile.upsert({
        userId: userId,
        nationalId: updates.nationalId,
        momoNumber: updates.momoNumber,
        currentAddress: updates.currentAddress
      }, { transaction });
    }

    await transaction.commit();
    return await getUserById(userId); 
  } catch (error) {
    await transaction.rollback();
    throw new Error("Update failed: " + error.message);
  }
};

/**
 * @desc Verify OTP and activate user
 */
const verifyOTP = async (email, otp) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("User not found");
  if (user.otp !== otp || new Date() > user.otpExpiry) throw new Error("Invalid or expired OTP");

  await user.update({ isVerified: true, otp: null, otpExpiry: null });
  return { token: generateToken(user.id), message: "Verified successfully" };
};

/**
 * @desc Regenerate and resend OTP
 */
const resendOTP = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("User not found");
  if (user.isVerified) throw new Error("User is already verified");
  
  const otp = generateOTP();
  await user.update({ otp, otpExpiry: new Date(Date.now() + 10 * 60 * 1000) });
  await sendOtpEmail(email, otp);
  return { message: "OTP resent successfully" };
};

/**
 * @desc Get all users (Admin)
 */
const getAllUsers = async () => {
  return await User.findAll({
    attributes: { exclude: ["password", "otp", "otpExpiry"] },
    include: [
      { model: LandlordProfile, as: 'landlordProfile' },
      { model: TenantProfile, as: 'tenantProfile' }
    ]
  });
};

/**
 * @desc Delete user (Admin)
 */
const deleteUser = async (id) => {
  const user = await User.findByPk(id);
  if (!user) throw new Error("User not found");
  await user.destroy();
  return true;
};

module.exports = {
  registerUser,
  loginUser,
  getUserById,
  updateUserProfile,
  verifyOTP,
  resendOTP,
  getAllUsers,
  deleteUser
};