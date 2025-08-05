import Badge from "../models/Badge.js";
import UserBadge from "../models/UserBadge.js";

export const createBadge = async (req, res) => {
  try {
    const badge = await Badge.create({ ...req.body, createdBy: req.user._id });
    res.json(badge);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getUserBadges = async (req, res) => {
  try {
    const badges = await UserBadge.find({ user: req.user._id }).populate(
      "badge"
    );
    res.json(badges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
