import Contest from "../models/Contest.model.js";
import User from "../models/User.model.js";

/* Create contest (creator or admin) */
export const createContest = async (req, res) => {
  try {
    const body = req.body;
    // req.user contains server JWT payload {id, email, role}
    // For creator role, ensure creatorId is firebaseUID stored in user doc
    const creator = await User.findById(req.user.id);
    if (!creator) return res.status(404).json({ message: "Creator not found" });

    const contestData = {
      title: body.title,
      description: body.description,
      image: body.image,
      type: body.type,
      price: body.price || 0,
      prize: body.prize,
      instruction: body.instruction,
      deadline: body.deadline,
      creatorId: creator.firebaseUID,
    };

    const contest = await Contest.create(contestData);
    res.status(201).json(contest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* List contests with pagination + filter + sort */
export const listContests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const skip = (page - 1) * limit;
    const { q, type, status, sortBy } = req.query;

    const filter = {};
    if (q) filter.title = { $regex: q, $options: "i" };
    if (type) filter.type = type;
    if (status) filter.status = status;

    let query = Contest.find(filter).skip(skip).limit(limit);
    if (sortBy === "participants")
      query = query.sort({ "participants.length": -1 });
    else if (sortBy === "newest") query = query.sort({ createdAt: -1 });
    else query = query.sort({ createdAt: -1 });

    const [results, total] = await Promise.all([
      query.exec(),
      Contest.countDocuments(filter),
    ]);

    res.json({ page, limit, total, results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* Approve contest (admin) */
export const approveContest = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Contest.findByIdAndUpdate(
      id,
      { status: "approved" },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* Join contest (user pays on frontend, then backend registers participant) */
export const joinContest = async (req, res) => {
  try {
    const { id } = req.params;
    // user identity from req.user -> find firebaseUID
    const currentUser = await User.findById(req.user.id);
    if (!currentUser)
      return res.status(404).json({ message: "User not found" });

    const contest = await Contest.findById(id);
    if (!contest) return res.status(404).json({ message: "Contest not found" });
    if (contest.status !== "approved")
      return res.status(400).json({ message: "Contest not open for joining" });

    // Prevent double join
    const already = contest.participants.find(
      (p) => p.userId === currentUser.firebaseUID
    );
    if (already) return res.status(400).json({ message: "Already joined" });

    contest.participants.push({
      userId: currentUser.firebaseUID,
      submittedAt: null,
    });
    await contest.save();

    // Add to user's joinedContests
    currentUser.joinedContests.push(contest._id);
    await currentUser.save();

    res.json({ message: "Joined successfully", contest });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* Submit task: add submissionUrl to participant record */
export const submitTask = async (req, res) => {
  try {
    const { id } = req.params; // contest id
    const { submissionUrl } = req.body;
    const currentUser = await User.findById(req.user.id);
    if (!currentUser)
      return res.status(404).json({ message: "User not found" });

    const contest = await Contest.findById(id);
    if (!contest) return res.status(404).json({ message: "Contest not found" });

    const participant = contest.participants.find(
      (p) => p.userId === currentUser.firebaseUID
    );
    if (!participant)
      return res.status(400).json({ message: "Not registered for contest" });

    participant.submissionUrl = submissionUrl;
    participant.submittedAt = new Date();
    await contest.save();

    res.json({ message: "Submission recorded" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* Declare winner (creator or admin) */
export const declareWinner = async (req, res) => {
  try {
    const { id } = req.params; // contest id
    const { winnerFirebaseUID } = req.body;

    const contest = await Contest.findById(id);
    if (!contest) return res.status(404).json({ message: "Contest not found" });

    // Ensure deadline passed or requester is admin
    const now = new Date();
    if (new Date(contest.deadline) > now && req.user.role !== "admin") {
      return res
        .status(400)
        .json({ message: "Cannot declare before deadline" });
    }

    contest.winner = { userId: winnerFirebaseUID, announcedAt: new Date() };
    contest.status = "completed";
    await contest.save();

    // increment user's wins
    const winnerUser = await User.findOne({ firebaseUID: winnerFirebaseUID });
    if (winnerUser) {
      winnerUser.totalWins = (winnerUser.totalWins || 0) + 1;
      winnerUser.wonContests.push(contest._id);
      await winnerUser.save();
    }

    res.json({ message: "Winner declared", contest });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
