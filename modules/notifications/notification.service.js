const { Notification } = require('../../models');
const ApiError = require('../../utils/ApiError');

const getUserNotifications = async (userId, { unreadOnly, page, limit, skip }) => {
  const filter = { user: userId };
  if (unreadOnly === 'true') filter.isRead = false;
  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filter),
    Notification.countDocuments({ user: userId, isRead: false }),
  ]);
  return { notifications, total, unreadCount };
};

const markAsRead = async (id, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: id, user: userId },
    { isRead: true },
    { new: true }
  );
  if (!notification) throw new ApiError(404, 'Notification not found');
  return notification;
};

const markAllAsRead = (userId) =>
  Notification.updateMany({ user: userId, isRead: false }, { isRead: true });

module.exports = { getUserNotifications, markAsRead, markAllAsRead };
