import Interview from "../models/Interview.js";
import Application from "../models/Application.js";

export const createInterview = async (req, res) => {
  try {
    const interview = await Interview.create({
      ...req.body,
      interviewer: req.user._id,
    });
    res.json(interview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find().populate(
      "interviewer",
      "username email"
    );
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const applyForInterview = async (req, res) => {
  try {
    const { interviewId } = req.body;
    const application = await Application.create({
      interview: interviewId,
      candidate: req.user._id,
    });
    res.json(application);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
