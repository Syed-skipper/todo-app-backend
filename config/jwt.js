require('dotenv').config();

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET || process.env.SECRET_KEY;
  if (!secret) {
    throw new Error(
      'JWT secret is missing. Set SECRET_KEY (or JWT_SECRET) in your .env file.'
    );
  }
  return secret;
};

module.exports = { getJwtSecret };
