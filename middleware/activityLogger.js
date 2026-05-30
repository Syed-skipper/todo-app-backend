const ActivityLog = require('../models/ActivityLog');

const logActivity = (action, entityType) => async (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode < 400 && req.user?.user_id) {
      ActivityLog.create({
        user: req.user.user_id,
        action,
        entityType,
        entityId: req.params.id || body?.data?._id,
        metadata: { method: req.method, path: req.originalUrl },
        ipAddress: req.ip,
      }).catch(console.error);
    }
    return originalJson(body);
  };
  next();
};

module.exports = logActivity;
