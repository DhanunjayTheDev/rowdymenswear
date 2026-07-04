const Notification = require('../models/Notification');
const { emitEvent } = require('../config/socket');

async function notify(type, message, extra = {}) {
  const { link = '', ...meta } = extra;
  const notification = await Notification.create({ type, message, link });
  emitEvent(type, { ...meta, message, link, notificationId: notification._id.toString() });
  return notification;
}

module.exports = { notify };
