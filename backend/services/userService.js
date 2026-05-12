// services/userService.js
const bcrypt       = require("bcryptjs");
const otpGenerator = require("otp-generator");
const { User, TenantProfile, LandlordProfile, AgentProfile, sequelize } = require("../model");
const generateToken     = require("../utils/generateToken");
const { sendOtpEmail }  = require("../config/emailConfig");
const profileCompletion = require("./profileCompletionService");

const generateOTP = () =>
  otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars:       false,
    lowerCaseAlphabets: false,
  });

// ── Register ──────────────────────────────────────────────────────────────────
const registerUser = async (userData) => {
  const {
    firstName, lastName, email, password, phone, role,
    // Optional at registration — for all roles
    nationalId, landlordId, profilePicture,
    // Landlord extras
    companyName,
    // Agent extras
    agencyName, licenseNumber,
  } = userData;

  const existing = await User.findOne({ where: { email } });
  if (existing) throw new Error("Email already registered");

  const hashedPassword = await bcrypt.hash(password, 10);
  const otp            = generateOTP();
  const otpExpiry      = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  const transaction = await sequelize.transaction();
  try {
    const user = await User.create({
      firstName,
      lastName,
      email,
      password:       hashedPassword,
      phone:          phone       || null,
      role:           role        || "tenant",
      nationalId:     nationalId  || null,   // optional
      landlordId:     landlordId  || null,   // optional, landlord only
      profilePicture: profilePicture || null, // optional
      otp,
      otpExpiry,
    }, { transaction });

    // Create role-specific profile
    if (user.role === "landlord") {
      await LandlordProfile.create({
        userId:      user.id,
        companyName: companyName || null,
      }, { transaction });

    } else if (user.role === "tenant") {
      await TenantProfile.create({
        userId: user.id,
      }, { transaction });

    } else if (user.role === "agent") {
      await AgentProfile.create({
        userId:        user.id,
        agencyName:    agencyName    || null,
        licenseNumber: licenseNumber || null,
      }, { transaction });
    }
    // admin: no profile model needed

    await transaction.commit();

    // Send OTP (non-fatal)
    try { await sendOtpEmail(email, otp); } catch (e) {
      console.warn("OTP email failed:", e.message);
    }

    return {
      id:      user.id,
      email:   user.email,
      role:    user.role,
      message: "Registration successful. Please verify your email.",
    };
  } catch (error) {
    await transaction.rollback();
    throw new Error(error.message || "Registration failed");
  }
};

// ── Login ─────────────────────────────────────────────────────────────────────
const loginUser = async ({ email, password }) => {
  const user = await User.findOne({
    where: { email },
    include: [
      { model: LandlordProfile, as: "landlordProfile", required: false },
      { model: TenantProfile,   as: "tenantProfile",   required: false },
      { model: AgentProfile,    as: "agentProfile",    required: false },
    ],
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error("Invalid email or password");
  }

  if (!user.isEmailVerified) throw new Error("Please verify your email first");
  if (user.isSuspended)      throw new Error("Your account has been suspended. Contact support.");

  // Update lastSeenAt
  await user.update({ lastSeenAt: new Date() });

  const token = generateToken(user.id);

  const profile =
    user.role === "landlord" ? user.landlordProfile :
    user.role === "tenant"   ? user.tenantProfile   :
    user.role === "agent"    ? user.agentProfile     : null;

  return {
    token,
    user: {
      id:             user.id,
      email:          user.email,
      firstName:      user.firstName,
      lastName:       user.lastName,
      role:           user.role,
      profilePicture: user.profilePicture,
      badges:         user.badges,
      profileCompletion: user.profileCompletion,
      hasAcceptedListingAgreement: user.hasAcceptedListingAgreement,
      profile,
    },
  };
};

// ── Verify OTP — FIXED: validates expiry properly ──────────────────────────────
const verifyOTP = async (email, otp) => {
  const user = await User.findOne({ where: { email } });
  if (!user)                                     throw new Error("User not found");
  if (user.otp !== otp)                          throw new Error("Invalid OTP");
  if (!user.otpExpiry || new Date() > user.otpExpiry) throw new Error("OTP has expired");

  await user.update({
    isEmailVerified: true,
    isVerified:      false, // KYC still pending admin review
    otp:             null,
    otpExpiry:       null,
  });

  // Compute initial profile completion after verification
  try { await profileCompletion.updateProfileCompletion(user.id); } catch (_) {}

  return {
    token: generateToken(user.id),
    user: {
      id:        user.id,
      email:     user.email,
      role:      user.role,
      firstName: user.firstName,
      lastName:  user.lastName,
    },
  };
};

// ── Resend OTP ────────────────────────────────────────────────────────────────
const resendOTP = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (!user)              throw new Error("User not found");
  if (user.isEmailVerified) throw new Error("Email is already verified");

  const otp = generateOTP();
  await user.update({ otp, otpExpiry: new Date(Date.now() + 10 * 60 * 1000) });

  try { await sendOtpEmail(email, otp); } catch (e) {
    console.warn("Resend OTP email failed:", e.message);
  }

  return { message: "OTP resent successfully" };
};

// ── Get user by ID ────────────────────────────────────────────────────────────
const getUserById = async (id) => {
  const user = await User.findByPk(id, {
    attributes: { exclude: ["password", "otp", "otpExpiry"] },
    include: [
      { model: LandlordProfile, as: "landlordProfile", required: false },
      { model: TenantProfile,   as: "tenantProfile",   required: false },
      { model: AgentProfile,    as: "agentProfile",    required: false },
    ],
  });
  if (!user) throw new Error("User not found");

  const data = user.toJSON();
  if (user.role !== "landlord") delete data.landlordProfile;
  if (user.role !== "tenant")   delete data.tenantProfile;
  if (user.role !== "agent")    delete data.agentProfile;

  return data;
};

// ── Update profile ────────────────────────────────────────────────────────────
const updateUserProfile = async (userId, updates) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

  const transaction = await sequelize.transaction();
  try {
    // Update base user fields
    await user.update({
      firstName:      updates.firstName      || user.firstName,
      lastName:       updates.lastName       || user.lastName,
      phone:          updates.phone          || user.phone,
      profilePicture: updates.profilePicture || user.profilePicture,
      nationalId:     updates.nationalId     || user.nationalId,
      landlordId:     updates.landlordId     || user.landlordId,
    }, { transaction });

    // Update role-specific profile
    if (user.role === "landlord") {
      await LandlordProfile.upsert({
        userId:          userId,
        companyName:     updates.companyName,
        tinNumber:       updates.tinNumber,
        businessAddress: updates.businessAddress,
        website:         updates.website,
        bio:             updates.bio,
      }, { transaction });

    } else if (user.role === "tenant") {
      await TenantProfile.upsert({
        userId:         userId,
        nationalId:     updates.nationalId,
        momoNumber:     updates.momoNumber,
        currentAddress: updates.currentAddress,
        occupation:     updates.occupation,
        monthlyIncome:  updates.monthlyIncome,
        bio:            updates.bio,
      }, { transaction });

    } else if (user.role === "agent") {
      await AgentProfile.upsert({
        userId:          userId,
        agencyName:      updates.agencyName,
        agencyAddress:   updates.agencyAddress,
        licenseNumber:   updates.licenseNumber,
        yearsExperience: updates.yearsExperience,
        specialization:  updates.specialization,
        bio:             updates.bio,
      }, { transaction });
    }

    await transaction.commit();

    // Recompute profile completion + badge checks
    await profileCompletion.updateProfileCompletion(userId);

    return getUserById(userId);
  } catch (error) {
    await transaction.rollback();
    throw new Error("Update failed: " + error.message);
  }
};

// ── Admin helpers ─────────────────────────────────────────────────────────────
const getAllUsers = async () => {
  return User.findAll({
    attributes: { exclude: ["password", "otp", "otpExpiry"] },
    include: [
      { model: LandlordProfile, as: "landlordProfile", required: false },
      { model: TenantProfile,   as: "tenantProfile",   required: false },
      { model: AgentProfile,    as: "agentProfile",    required: false },
    ],
  });
};

const deleteUser = async (id) => {
  const user = await User.findByPk(id);
  if (!user) throw new Error("User not found");
  await user.destroy();
  return true;
};

module.exports = {
  registerUser, loginUser, verifyOTP, resendOTP,
  getUserById, updateUserProfile, getAllUsers, deleteUser,
};