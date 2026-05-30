const notificationService = require('./notification.service');
const { sendSuccess, sendPaginated } = require('../../utils/response');
const { getPagination, buildPaginationMeta } = require('../../utils/pagination');

const getNotifications = async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { notifications, total, unreadCount } = await notificationService.getUserNotifications(
    req.user.user_id,
    { ...req.query, page, limit, skip }
  );
  sendPaginated(res, { notifications, unreadCount }, buildPaginationMeta(total, page, limit));
};

const markAsRead = async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user.user_id);
  sendSuccess(res, notification);
};

const markAllAsRead = async (req, res) => {
  await notificationService.markAllAsRead(req.user.user_id);
  sendSuccess(res, { message: 'All notifications marked as read' });
};

module.exports = { getNotifications, markAsRead, markAllAsRead };
