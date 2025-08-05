import Notification from "../models/Notification.js";

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ receiver: req.user._id });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
