import Contest from "../models/Contest.model.js";

/**
 * GET all contests (Admin)
 */
export const getAllContestsAdmin = async (req, res) => {
  const contests = await Contest.find()
    .populate("creator", "name email")
    .sort({ createdAt: -1 });

  res.json(contests);
};

/**
 * APPROVE contest
 */
export const approveContest = async (req, res) => {
  const { id } = req.params;

  const contest = await Contest.findById(id);
  if (!contest) {
    return res.status(404).json({ message: "Contest not found" });
  }

  contest.status = "approved";
  contest.approvedBy = req.user._id;

  await contest.save();

  res.json({ message: "Contest approved successfully" });
};

/**
 * REJECT contest
 */
export const rejectContest = async (req, res) => {
  const { id } = req.params;

  const contest = await Contest.findById(id);
  if (!contest) {
    return res.status(404).json({ message: "Contest not found" });
  }

  contest.status = "rejected";
  await contest.save();

  res.json({ message: "Contest rejected successfully" });
};

/**
 * DELETE contest
 */
export const deleteContest = async (req, res) => {
  const { id } = req.params;

  const contest = await Contest.findById(id);
  if (!contest) {
    return res.status(404).json({ message: "Contest not found" });
  }

  await contest.deleteOne();

  res.json({ message: "Contest deleted successfully" });
};

export const allContestReports =  async (req, res) => {
  try {
    const contestReports = await Contest
      .find({})
      .select("creatorId prize status createdAt")
      .populate("creatorId", "name email")
      .sort({ createdAt: -1 });
    res.json(contestReports);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}