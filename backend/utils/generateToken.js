const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set in environment");
  }

  return jwt.sign({ id }, secret, {
    expiresIn: "7d",
  });
};

module.exports = generateToken;
