import DSAQuestion from "../models/DSAQuestion.js";

export const addDSAQuestion = async (req, res) => {
  try {
    const question = await DSAQuestion.create({
      ...req.body,
      createdBy: req.user._id,
    });
    res.json(question);
  } catch (error) {
    console.error("Error in addDSAQuestion:", error.message);
    res.status(400).json({ message: error.message });
  }
};

export const getAllDSAQuestions = async (req, res) => {
  try {
    const questions = await DSAQuestion.find();
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
