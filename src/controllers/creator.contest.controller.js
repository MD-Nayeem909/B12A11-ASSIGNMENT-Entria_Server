import Contest from "../models/Contest.model.js";
import Submission from "../models/Submission.model.js";

//  Create Contest
export const createContest = async (req, res) => {
  try {
    const contest = await Contest.create({
      ...req.body,
      creatorId: req.user.id,
    });

    res.status(201).json(contest);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

//  Get My Contests
export const getMyContests = async (req, res) => {
  const contests = await Contest.find({ creatorId: req.user.id }).sort({
    createdAt: -1,
  });

  res.json(contests);
};

//  Update Contest (only pending)
export const updateContest = async (req, res) => {
  const contest = await Contest.findById(req.params.id);

  if (!contest) return res.status(404).json({ message: "Contest not found" });

  if (contest.creatorId.toString() !== req.user.id.toString())
    return res.status(403).json({ message: "Not your contest" });

  if (contest.status !== "pending")
    return res
      .status(400)
      .json({ message: "Only pending contests can be edited" });

  Object.assign(contest, req.body);
  await contest.save();

  res.json(contest);
};

//  Delete Contest (only pending)
export const deleteContest = async (req, res) => {
  const contest = await Contest.findById(req.params.id);

  if (!contest) return res.status(404).json({ message: "Contest not found" });

  if (contest.creator.toString() !== req.user._id.toString())
    return res.status(403).json({ message: "Not your contest" });

  if (contest.status !== "pending")
    return res
      .status(400)
      .json({ message: "Only pending contests can be deleted" });

  await contest.deleteOne();
  res.json({ message: "Contest deleted successfully" });
};

//  Declare Winner
export const declareWinner = async (req, res) => {
  const { winnerUserId } = req.body;

  const contest = await Contest.findById(req.params.id);

  if (!contest) return res.status(404).json({ message: "Contest not found" });

  if (contest.creator.toString() !== req.user._id.toString())
    return res.status(403).json({ message: "Not your contest" });

  if (contest.winner)
    return res.status(400).json({ message: "Winner already declared" });

  contest.winner = winnerUserId;
  contest.status = "completed";
  await contest.save();

  // optional: mark submission as winner
  await Submission.findOneAndUpdate(
    { contest: contest._id, user: winnerUserId },
    { isWinner: true }
  );

  res.json({ message: "Winner declared successfully", contest });
};
