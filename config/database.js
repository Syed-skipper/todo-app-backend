require('dotenv').config();

const getMongoConfig = () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    throw new Error(
      'MongoDB URI is missing. Set MONGODB_URI (or MONGO_URI) in your .env file.'
    );
  }
  const options = {};
  if (process.env.MONGODB_DB_NAME) {
    options.dbName = process.env.MONGODB_DB_NAME;
  }
  return { uri, options };
};

module.exports = { getMongoConfig };
